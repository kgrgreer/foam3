/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaConsensusMonitor',

  implements: [
    'foam.core.ContextAgent',
    'foam.core.ContextAware',
    'foam.nanos.NanoService'
  ],

  documentation: `Poll system to detect if stalled waiting on consensus`,

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.Arrays',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'timerInterval',
      class: 'Long',
      units: 'ms',
      value: 30000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      units: 'ms',
      value: 60000
    },
    {
      documentation: 'A second replay on the same index will not occur until at least minReplayInterval has past',
      name: 'minReplayInterval',
      class: 'Long',
      units: 'ms',
      value: 360000
    },
    {
      name: 'medusaDAO',
      class: 'String',
      value: 'medusaMediatorDAO'
    },
    {
      name: 'lastIndex',
      class: 'Long',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      name: 'lastIndexSince',
      class: 'Long',
      units: 'ms',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      name: 'lastReplay',
      class: 'Long',
      units: 'ms',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
  ],

  methods: [
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName());
      setTimer(timer);
      timer.scheduleAtFixedRate(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(),
        getTimerInterval()
      );
      `
    },
    {
      // NOTE: this keeps running if promoter exits.
      documentation: 'Monitor for consensus stalls',
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      PM pm = PM.create(x, this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");

      try {
        DAO alarmDAO = (DAO) x.get("alarmDAO");
        String alarmName = "Medusa Consensus";
        Alarm alarm = new Alarm(alarmName);
        alarm = (Alarm) alarmDAO.find(alarm);

        if ( getLastIndex() == 0L ||
             getLastIndex() != replaying.getIndex() ) {
          logger.debug("execute", "skip", getLastIndex(), replaying.getIndex());
          setLastIndex(replaying.getIndex());
          setLastIndexSince(System.currentTimeMillis());
          setLastReplay(0L);
          if ( alarm != null &&
               alarm.getIsActive() ) {
            alarm = (Alarm) alarm.fclone();
            alarm.setIsActive(false);
            alarmDAO.put(alarm);
          }
          return;
        }

        DAO medusaDAO = (DAO) x.get(getMedusaDAO());
        Long nextIndex = replaying.getIndex() + 1;
        MedusaEntry next = (MedusaEntry) medusaDAO.find(nextIndex);
        if ( next == null ) {
          return;
        }
        if ( next.getPromoted() ) {
          setLastIndex(nextIndex);
          setLastIndexSince(System.currentTimeMillis());
          setLastReplay(0L);
          if ( alarm != null &&
               alarm.getIsActive() ) {
            alarm = (Alarm) alarm.fclone();
            alarm.setIsActive(false);
            alarmDAO.put(alarm);
          }
          return;
        }

        // not null, not promoted, and in this state for at least a timer cycle
        logger.warning("no consensus", next.getConsensusCount(), "of", support.getNodeQuorum(), "on", next.toSummary(), "nodes", Arrays.toString(next.getConsensusNodes()), "since", new java.util.Date(getLastIndexSince()));

        if ( alarm == null ) {
          alarm = new Alarm(alarmName, true);
          alarm.setClusterable(false);
        } else {
          alarm = (Alarm) alarm.fclone();
        }
        alarm.setIsActive(true);
        alarm.setNote("No Consensus: "+next.toSummary());
        alarm = (Alarm) alarmDAO.put(alarm);

        if ( getLastReplay() == 0L ||
             System.currentTimeMillis() - getLastReplay() >= getMinReplayInterval() ) {
          logger.info("request replay");
          final ReplayRequestCmd cmd = new ReplayRequestCmd();
          cmd.setDetails(new ReplayDetailsCmd.Builder(x).setMinIndex(next.getIndex()).build());
          Agency agency = (Agency) x.get(support.getThreadPoolName());
          agency.submit(x,
            new ContextAgent() {
              public void execute(X x) {
                ((DAO) x.get("localClusterConfigDAO")).cmd(cmd);
              }
            }, this.getClass().getSimpleName()
          );
          setLastReplay(System.currentTimeMillis());
        }
      } catch (Throwable t) {
        logger.warning(t.getMessage(), t);
        pm.error(x, t);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
