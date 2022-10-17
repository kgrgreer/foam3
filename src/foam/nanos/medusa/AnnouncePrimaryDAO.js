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
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
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
      name: 'ALARM_NAME',
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

      // generate an alarm
      Alarm alarm = new Alarm.Builder(x)
        .setName(ALARM_NAME)
        .setIsActive(false)
        .setReason(AlarmReason.MANUAL)
        .setNote(myConfig.getId())
        .setClusterable(false)
        .build();
      alarm = (Alarm) ((DAO) x.get("alarmDAO")).put(alarm);

      AssemblyLine line = new AsyncAssemblyLine(x, null, support.getThreadPoolName());
      final Map<Long, Long> counts = new ConcurrentHashMap();
      final Set<String> replies = new HashSet();
      List<ClusterConfig> nodes = support.getReplayNodes();
      for ( ClusterConfig cfg : nodes ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            DAO client = support.getClientDAO(x, "medusaEntryDAO", myConfig, cfg);
            Long m = 0L;
            ReplayDetailsCmd details = new ReplayDetailsCmd();
            details.setRequester(myConfig.getId());
            details.setResponder(cfg.getId());
            try {
              details = (ReplayDetailsCmd) client.cmd_(x, details);
              m = details.getMaxIndex();
              replies.add(cfg.getId());
            } catch (RuntimeException e) {
              logger.error(cfg.getId(), e);
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
          logger.info("waiting on index verification");
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() >= nodes.size() -1 ) {
          break;
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
        if ( replies.size() < nodes.size() -1 ) {
          logger.debug("replies", replies.size(), "nodes", nodes.size());
          logger.error("Index verification", "failed", "Unable to determine max index", "PAUSING");
        } else {
          logger.debug("max", max, "count", count, "quorum", quorum);
          logger.error("Index verification", "failed", "Max index does not have quorum", "PAUSING");
        }

        alarm = (Alarm) alarm.fclone();
        alarm.setSeverity(foam.log.LogLevel.ERROR);
        alarm.setNote("Index Verification Failed");
        ((DAO) x.get("alarmDAO")).put(alarm);

        // Halt the system.
        logger.error("After manual verification, cycle Primary (ONLINE->OFFLINE->ONLINE) which will repeat Index Verification");
        ClusterConfig cfg = (ClusterConfig) myConfig.fclone();
        cfg.setStatus(Status.OFFLINE);
        cfg.setErrorMessage("Index verification failed");
        ((DAO) x.get("localClusterConfigDAO")).put(cfg);
      } else {
        ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
        logger.debug("max", max, "index", replaying.getIndex());
        replaying.updateIndex(x, max);
        replaying.setReplaying(false);
        logger.info("Index verification", "complete");

        alarm = (Alarm) alarm.fclone();
        alarm.setIsActive(false);
        ((DAO) x.get("alarmDAO")).put(alarm);
      }
      `
    }
  ]
});
