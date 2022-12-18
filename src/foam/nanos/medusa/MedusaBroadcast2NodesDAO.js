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
    'foam.core.FObject',
    'foam.core.X',
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
      // TODO: clear on ClusterConfig DAO updates
      name: 'clients',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      name: 'queues',
      class: 'Map',
      javaFactory: 'return new HashMap();'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      name: 'logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return Loggers.logger(getX(), this, this.getServiceName());
      `
    },
  ],

  methods: [
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
        inFlight_.getAndIncrement();
        AssemblyLine queue = (AssemblyLine) getQueues().get(id);
        if ( queue == null ) {
          synchronized ( this ) {
            queue = (AssemblyLine) getQueues().get(id);
            if ( queue == null ) {
              ClusterConfig config = support.getConfig(x, id);
              DAO dao = support.getBroadcastClientDAO(x, getServiceName(), myConfig, config);
              // TODO: implment java send in RetryBox and move this to ClusterConfigSupport getSocketClientBox
              dao = new RetryClientSinkDAO.Builder(x)
                       .setDelegate(dao)
                       .setMaxRetryAttempts(-1) // forever
                       .setMaxRetryDelay(support.getMaxRetryDelay())
                       .build();
              getClients().put(id, dao);
              // Create one AssemblyLine per node and perform dao put under lock
              // to force node writes to be sequential, but more importantly,
              // there will only be one retry, rather than every thread retrying.
              // To be replaced by SAF (Store and Forward)
              queue = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
              getQueues().put(id, queue);
            }
          }
        }
        queue.enqueue(new AbstractAssembly() {
          public void executeUnderLock() {
            // logger.debug("AssemblyLine", "executeUnderLock", id);
            ((DAO) getClients().get(id)).put_(x, entry);
            inFlight_.getAndDecrement();
            ((OMLogger) x.get("OMLogger")).log("medusa.broadcast.mediator-node");
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
