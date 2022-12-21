/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcastDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntry to Mediators.`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'foam.util.concurrent.SyncAssemblyLine',
    'java.util.ArrayList',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'java.util.concurrent.atomic.AtomicLong'
  ],
  
  javaCode: `
    protected AtomicLong inFlight_ = new AtomicLong();
  `,

  constants: [
    {
      documentation: 'return inFlight_ count.',
      name: 'IN_FLIGHT_CMD',
      type: 'String',
      value: 'IN_FLIGHT_CMD',
    }
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      javaFactory: `
      return "medusaMediatorDAO";
      `
    },
    {
      name: 'maxRetryAttempts',
      class: 'Int',
      value: 4
    },
    {
      // TODO: clear on ClusterConfig DAO updates
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'queues',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      // Loggers.logger(x, this).debug("put", entry.getIndex());

      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      MedusaEntry old = (MedusaEntry) getDelegate().find_(x, entry.getId());
      entry = (MedusaEntry) getDelegate().put_(x, entry).fclone();

      if ( support.getStandAlone() ) {
        if ( old == null ) {
          return ((DAO) x.get(getServiceName())).put_(x, entry);
        }
        return entry;
      }

      if ( myConfig.getType() == MedusaType.NODE &&
           myConfig.getStatus() == Status.ONLINE ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        replaying.updateIndex(x, entry.getIndex());
      } else if ( myConfig.getType() == MedusaType.MEDIATOR &&
                  myConfig.getStatus() == Status.ONLINE && 
                  entry.getPromoted() ) {
        entry = (MedusaEntry) submit(x, entry, DOP.PUT);
      }
      return entry;
      `
    },
    {
      documentation: 'Using assembly line, write to all online mediators in zone 0 and same realm,region',
      name: 'cmd_',
      javaCode: `
      Object cmd = getDelegate().cmd_(x, obj);
      if ( ! DAO.PURGE_CMD.equals(obj) ) {
        submit(x, obj, DOP.CMD);
        return cmd;
      }
      if ( IN_FLIGHT_CMD.equals(obj) ) {
        return inFlight_.get();
      }
      return cmd;
      `
    },
    {
      documentation: 'Using assembly line, write to mediators',
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
      ],
      type: 'Object',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      // logger.debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      for ( ClusterConfig config : support.getBroadcastMediators() ) {
        String id = config.getId();
        // logger.debug("submit", "job", id, dop.getLabel(), "assembly");
        AssemblyLine queue = (AssemblyLine) getQueues().get(id);
        if ( queue == null ) {
          synchronized ( this ) {
            queue = (AssemblyLine) getQueues().get(id);
            if ( queue == null ) {
              DAO dao = (DAO) getClients().get(id);
              if ( dao == null ) {
                // TODO: implement java send in RetryBox and move this to ClusterConfigSupport getSocketClientBox
                dao = new RetryClientSinkDAO.Builder(x)
                 .setDelegate(support.getBroadcastClientDAO(x, getServiceName(), myConfig, config))
                 .setMaxRetryAttempts(getMaxRetryAttempts())
                 .setMaxRetryDelay(support.getMaxRetryDelay())
                 .build();
                getClients().put(id, dao);
              }
              // Create one AssemblyLine per mediator and perform dao put under lock
              // so there will only be one retry, rather than every thread retrying.
              // To be replaced by SAF (Store and Forward)
              queue = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
              getQueues().put(id, queue);
            }
          }
        }
        queue.enqueue(new AbstractAssembly() {
          public void executeUnderLock() {
            // logger.debug("AssemblyLine", "executeUnderLock", id);
            try {
              if ( DOP.PUT == dop ) {
                ((DAO) getClients().get(id)).put_(x, (FObject) obj);
              } else if ( DOP.CMD == dop ) {
                ((DAO) getClients().get(id)).cmd_(x, obj);
              }
              ((OMLogger) x.get("OMLogger")).log("medusa.broadcast.node-mediator");
              inFlight_.getAndDecrement();
            } catch ( Throwable t ) {
              logger.error("assembly", "executeUnderLock", id, t);
            }
          }
        });
      }
      return obj;
    `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( IN_FLIGHT_CMD.equals(obj) ) {
        return inFlight_.get();
      }
      return getDelegate().cmd_(x, obj);
      `
    }
  ]
});
