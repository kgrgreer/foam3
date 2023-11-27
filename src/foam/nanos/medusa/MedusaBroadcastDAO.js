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
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
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
      if ( IN_FLIGHT_CMD.equals(obj) ) {
        return inFlight_.get();
      }
      Object cmd = getDelegate().cmd_(x, obj);
      if ( ! DAO.PURGE_CMD.equals(obj) ) {
        submit(x, obj, DOP.CMD);
        return cmd;
      }
      return cmd;
      `
    },
    {
      documentation: 'Using assembly line, write to mediators',
      name: 'submit',
      args: 'X x, Object obj, DOP dop',
      type: 'Object',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      // logger.debug("submit", dop.getLabel(), obj.getClass().getSimpleName());

      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      for ( ClusterConfig config : support.getBroadcastMediators() ) {
        String id = config.getId();
        // logger.debug("submit", "job", id, dop.getLabel(), "assembly");
        inFlight_.getAndIncrement();
        getQueue(x, id).enqueue(new AbstractAssembly() {
          public void executeJob() {
            try {
              DAO client = getClient(x, id, config);
              if ( client != null ) {
                if ( DOP.PUT == dop ) {
                  client.put_(x, (FObject) obj);
                } else if ( DOP.CMD == dop ) {
                  client.cmd_(x, obj);
                }
              }
            } catch ( Throwable t ) {
              logger.error("assembly", id, t);
            } finally {
              inFlight_.getAndDecrement();
              ((OMLogger) x.get("OMLogger")).log("medusa:broadcast:node-mediator");
            }
          }
        });
      }
      return obj;
    `
    },
    {
      name: 'getQueue',
      args: 'X x, String id',
      type: 'AssemblyLine',
      javaCode: `
        AssemblyLine queue = (AssemblyLine) getQueues().get(id);
        if ( queue != null ) return queue;
        synchronized ( id.intern() ) {
          queue = (AssemblyLine) getQueues().get(id);
          if ( queue != null ) return queue;

          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

          // Create one AssemblyLine per mediator 
          // REVIEW : consider SAF (Store and Forward)

          // NOTE: Using Sync rather than Async, as Async has the ability
          // to consume the threadpool with a Retry client.
          // Throughput testing does not show a difference between
          // Sync and Async.
          // queue = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
          queue = new SyncAssemblyLine(x);
          getQueues().put(id, queue);
        }
        return queue;
      `
    },
    {
      name: 'getClient',
      args: 'X x, String id, ClusterConfig config',
      type: 'foam.dao.DAO',
      javaCode: `
        DAO client = (DAO) getClients().get(id);
        if ( client != null ) return client;
        synchronized ( id.intern() ) {
          client = (DAO) getClients().get(id);
          if ( client != null ) return client;

          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
          // TODO: implement java send in RetryBox and move this to ClusterConfigSupport getSocketClientBox
          client = new RetryClientSinkDAO.Builder(x)
            .setName(config.getId())
            .setDelegate(support.getBroadcastClientDAO(x, getServiceName(), myConfig, config))
            .setMaxRetryAttempts(getMaxRetryAttempts())
            .setMaxRetryDelay(support.getMaxRetryDelay())
            .build();
          getClients().put(id, client);
        }
        return client;
      `
    }
  ]
});
