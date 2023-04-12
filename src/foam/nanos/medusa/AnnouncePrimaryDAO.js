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
    'foam.log.LogLevel',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'java.util.List',
    'java.util.HashMap',
    'java.util.HashSet',
    'java.util.Map',
    'java.util.Set',
    'java.util.concurrent.ConcurrentHashMap',
  ],

  constants: [
    {
      name: 'EVENT_NAME',
      type: 'String',
      value: 'Medusa Primary Announce'
    }
  ],

  properties: [
    {
      name: 'indexVerificationMaxWait',
      class: 'Long',
      value: 600000, // 10 minutes.
      units: 'ms'
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
      if ( nu.getId().equals(myConfig.getId()) &&
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
      args: 'Context x',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      final ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      final ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      EventRecord er = new EventRecord(x, "Medusa", EVENT_NAME, "Index verification starting", LogLevel.INFO, null);
      er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
      er.clearId();

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map<Long, Long> counts = new ConcurrentHashMap();
      final Set<String> replies = new HashSet();
      final Set<String> errors = new HashSet();
      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "medusaNodeDAO", myConfig, cfg);
            Long m = 0L;
            ReplayDetailsCmd details = new ReplayDetailsCmd();
            details.setRequester(myConfig.getId());
            details.setResponder(cfg.getId());
            try {
              details = (ReplayDetailsCmd) client.cmd_(x, details);
              m = details.getMaxIndex();
              if ( m == 0 ) {
                // connection errors are not thrown back when using a retry client
                // TODO: new clients could be an issue with zero data.
                logger.error(cfg.getId(), "no reply");
                errors.add(cfg.getId());
              } else {
                replies.add(cfg.getId());
              }
            } catch (RuntimeException e) {
              logger.error(cfg.getId(), e);
              errors.add("cfg.getId() "+e.getMessage());
            }
            logger.info(cfg.getId(), "max", m);
            synchronized ( this ) {
              Long count = counts.get(m);
              if ( count == null ) {
                count = new Long(0);
              }
              count = new Long(count.longValue() + 1);
              counts.put(m, count);
            }
          }
        });
      }
      logger.debug("line.shutdown", "wait");
      // NOTE: this will block forever if a node does not reply.
      // line.shutdown();
      // Perform manual polling for completion.
      long waited = 0L;
      long sleep = 10000L;
      while ( waited < getIndexVerificationMaxWait() ) {
        try {
          logger.info("waiting on index verification, replies", replies.size(), "errors", errors.size(), "nodes", nodes.size(), "waiting", getIndexVerificationMaxWait() - waited);
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() >= nodes.size() -1 ) {
          break;
        }
        if ( errors.size() >= nodes.size() -1 ) {
          break;
        }
        if ( support.getPrimary(x).getId() != myConfig.getId() ) {
          // Another vote occurred, another mediator is primary
          // Abandon announce.
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          replaying.setReplaying(false);
          er.setMessage("Index verification abandoned");
          er.setSeverity(LogLevel.INFO);
          ((DAO) x.get("eventRecordDAO")).put(er);
          return;
        }
      }
      logger.debug("line.shutdown", "continue");

      long max = 0L;
      for ( Long m : counts.keySet() ) {
        if ( m > max ) {
          max = m;
        }
      }
      Long count = counts.get(max);
      long quorum = support.getNodeQuorum();

      if ( replies.size() < nodes.size() -1 ||
           count == null ||
           count < support.getNodeQuorum() ) {
        String message = null;
        if ( replies.size() < nodes.size() -1 ) {
          logger.debug("replies", replies.size(), "nodes", nodes.size());
          message = "Index verification failed; unable to determine max index.";
        } else {
          logger.debug("max", max, "count", count, "quorum", quorum);
          message = "Index verification failed; max index does not have quorum.";
        }
        er.setMessage(message);
        er.setSeverity(LogLevel.ERROR);
        er.setClusterable(false);
        ((DAO) x.get("eventRecordDAO")).put(er);

        // Halt the system.
        er = new EventRecord(x, "Medusa", "Mediator going OFFLINE", "After manual verification, cycle Primary (ONLINE->OFFLINE->ONLINE) which will repeat Index Verification", LogLevel.ERROR, null);
        er.setClusterable(false);
        ((DAO) x.get("eventRecordDAO")).put(er);
        ClusterConfig cfg = (ClusterConfig) myConfig.fclone();
        cfg.setStatus(Status.OFFLINE);
        cfg.setErrorMessage("Index verification failed");
        ((DAO) x.get("localClusterConfigDAO")).put(cfg);
      } else {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        logger.debug("max", max, "index", replaying.getIndex());
        replaying.updateIndex(x, max);
        replaying.setReplaying(false);
        er.setMessage("Index verification complete");
        er.setSeverity(LogLevel.INFO);
        ((DAO) x.get("eventRecordDAO")).put(er);
      }
      `
    }
  ]
});
