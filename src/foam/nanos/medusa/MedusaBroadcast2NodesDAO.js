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
      documentation: 'Maximum retries of a retry client. Set to -1 for infinite retry',
      name: 'maxRetryAttempts',
      class: 'Int',
      value: -1
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
      documentation: `Distribute entry to each node in one bucket. Mod of entry.id and bucket.size selects the bucket to receive the entry.`,
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      MedusaEntry entry = (MedusaEntry) obj;
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

      List<Set> buckets = support.getNodeBuckets();
      int index = (int) (entry.getIndex() % buckets.size());
      Set<String> bucket = buckets.get(index);
      for ( String id : bucket ) {
        inFlight_.getAndIncrement();
        getQueue(x, id).enqueue(new AbstractAssembly() {
          public void executeJob() {
            try {
              DAO client = getClient(x, id);
              if ( client != null )
                client.put_(x, entry);
            } catch ( Throwable t ) {
              logger.error("assembly", id, t);
            } finally {
              inFlight_.getAndDecrement();
              ((OMLogger) x.get("OMLogger")).log("medusa:broadcast:mediator-node");
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
      args: 'X x, String id',
      type: 'foam.dao.DAO',
      javaCode: `
        DAO client = (DAO) getClients().get(id);
        if ( client != null ) return client;
        synchronized ( id.intern() ) {
          client = (DAO) getClients().get(id);
          if ( client != null ) return client;

          ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
          ClusterConfig myConfig = support.getConfig(x, support.getConfigId());
          ClusterConfig config = support.getConfig(x, id);
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
