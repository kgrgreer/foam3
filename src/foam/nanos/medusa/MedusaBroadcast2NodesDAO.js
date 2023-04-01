/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaBroadcast2NodesDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Broadcast MedusaEntry to Nodes. Each entry is distributed to set of nodes for redundancy and consensus.`,

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
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
    'java.util.Set',
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
      return "medusaNodeDAO";
      `
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
      documentation: 'listen and clear client and queue caches on cluster changes',
      name: 'init_',
      javaCode: `
      DAO dao = (DAO) getX().get("clusterConfigDAO");
      dao.listen( new AbstractSink() {
        @Override
        public void put(Object obj, Detachable sub) {
          ClusterConfig config = (ClusterConfig) obj;
          if ( config.getType() == MedusaType.MEDIATOR ) {
            synchronized ( this ) {
              ((Logger) getX().get("logger")).info("MedusaBroadcast2NodesDAO,listener,purge");
              MedusaBroadcast2NodesDAO.CLIENTS.clear(this);
              MedusaBroadcast2NodesDAO.QUEUES.clear(this);
            }
          }
        }
      }, null);
      `
    },
    {
      documentation: `Distribute entry to each node in one bucket. Mod of entry.id and bucket.size selects the bucket to receive the entry.`,
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      MedusaEntry entry = (MedusaEntry) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      List<Set> buckets = support.getNodeBuckets();
      int index = (int) (entry.getIndex() % buckets.size());
      Set<String> bucket = buckets.get(index);
      for ( String id : bucket ) {
        // om.log("medusa.broadcast.nodes", "request");
        AssemblyLine queue = (AssemblyLine) getQueues().get(id);
        if ( queue == null ) {
          synchronized ( this ) {
            queue = (AssemblyLine) getQueues().get(id);
            if ( queue == null ) {
              // Create one AssemblyLine per node and perform dao put under lock
              // to force node writes to be sequential, but more importantly,
              // there will only be one retry, rather than every thread retrying.
              // To be replaced by SAF (Store and Forward)
              queue = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
              getQueues().put(id, queue);

              ClusterConfig config = support.getConfig(x, id);
              DAO dao = support.getBroadcastClientDAO(x, getServiceName(), myConfig, config);
              // TODO: implment java send in RetryBox and move this to ClusterConfigSupport getSocketClientBox
              dao = new RetryClientSinkDAO.Builder(x)
                       .setDelegate(dao)
                       .setMaxRetryAttempts(-1) // forever
                       .setMaxRetryDelay(support.getMaxRetryDelay())
                       .build();
              getClients().put(id, dao);
            }
          }
        }
        inFlight_.getAndIncrement();
        queue.enqueue(new AbstractAssembly() {
          // TODO: review use of executeUnderLock
          public void executeUnderLock() {
            // logger.debug("AssemblyLine", "executeUnderLock", id);
            try {
              ((DAO) getClients().get(id)).put_(x, entry);
            } catch ( Throwable t ) {
              logger.error("assembly", "executeUnderLock", id, t);
            } finally {
              inFlight_.getAndDecrement();
              ((OMLogger) x.get("OMLogger")).log("medusa.broadcast.mediator-node");
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
