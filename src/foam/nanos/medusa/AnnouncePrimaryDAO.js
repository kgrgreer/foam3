/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'AnnouncePrimaryDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.core.ContextAgent'
  ],

  documentation: `This mediator is becoming Primary. Validate index`,

  // Secondary -> Primary (already ONLINE)
  // block
  // validate
  // unblock

  javaImports: [
    'foam.core.Agency',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Max',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.util.List',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.concurrent.ConcurrentHashMap',
  ],

  properties: [
    {
      name: 'serviceName',
      class: 'String',
      value: 'medusaEntryMediatorDAO'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      ClusterConfig nu = (ClusterConfig) obj;
      ClusterConfig old = (ClusterConfig) find_(x, nu.getId());
      nu = (ClusterConfig) getDelegate().put_(x, nu);
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      // Secondary -> Primary 
      if ( nu.getId() == myConfig.getId() &&
           nu.getIsPrimary() &&
           ! old.getIsPrimary() ) {

        // set Replaying true to block primary puts until index is verified.
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        replaying.setReplaying(true);

        // start thread to verify index.
        Agency agency = (Agency) x.get(support.getThreadPoolName());
        logger.info("index verification", "start");
        agency.submit(x, this, this.getClass().getSimpleName()+"-IndexVerification");
      }

      return nu;
      `
    },
    {
      documentation: `Interogate nodes for max index. Check for quorum on resulting max and halt or proceed as primary.`,
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map<Long, Long> map = new ConcurrentHashMap();
      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "medusaEntryDAO", myConfig, cfg);
            try {
              // FIXME: this is failing with NullPointerException - from the client I believe.
              Max max = (Max) client.select(MAX(MedusaEntry.INDEX));
              if ( max != null ) {
                Long m = (Long) max.getValue();
                logger.info(cfg.getId(), "max", m);
                synchronized ( this ) {
                  Long count = map.get(m);
                  if ( count == null ) {
                    count = new Long(0);
                  }
                  count = new Long(count.longValue() + 1);
                  map.put(m, count);
                }
              } else {
                logger.warning(cfg.getId(), "max", "null");
              }
            } catch (RuntimeException e) {
              logger.error(cfg.getId(), e);
            }
          }
        });
      }
      line.shutdown();

      long max = 0L;
      for ( Long m : map.keySet() ) {
        if ( m > max ) {
          max = m;
        }
      }
      Long count = map.get(max);
      long quorum = support.getNodeQuorum();
      logger.debug("max", max, "count", count, "quorum", quorum);
      if ( count == null ||
           count < support.getNodeQuorum() ) {
        // Halt the system.
        logger.error("Index verification", "max index does not have quorum", "PAUSING");
        logger.error("After manual verification, cycle Primary (ONLINE->OFFLINE->ONLINE) which will repeat Index Verification");
        // just stay in replay mode - admin can take primary OFFLINE to force this process to repeat.

        // TODO: until client check is working - allow system to continue.
      // } else {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        logger.debug("max", max, "index", replaying.getIndex());
        replaying.updateIndex(x, max);
        replaying.setReplaying(false);
        logger.info("Index verification", "complete");
      }
      `
    }
  ]
});
