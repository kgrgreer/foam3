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
    'foam.log.LogLevel',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.MAX',
    'foam.mlang.sink.Max',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil',
    'java.util.Arrays',
    'java.util.Timer'
  ],

  constants: [
    {
      name: 'EVENT_NAME',
      type: 'String',
      value: 'Medusa Consensus'
    }
  ],

  properties: [
    {
      name: 'timerInterval',
      class: 'Long',
      units: 'ms',
      value: 60000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      units: 'ms',
      value: 300000 // 5 minutes
    },
    {
      documentation: 'A second replay on the same index will not occur until at least minReplayInterval has past',
      name: 'minReplayInterval',
      class: 'Long',
      units: 'ms',
      value: 300000 // 5 minutes
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
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    },
    {
      name: 'eventRecord',
      class: 'FObjectProperty',
      of: 'foam.nanos.er.EventRecord'
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
      setEventRecord(new EventRecord(getX(), this, EVENT_NAME));
      `
    },
    {
      name: 'stop',
      javaCode: `
      Timer timer = (Timer) getTimer();
      if ( timer != null ) {
        Loggers.logger(getX(), this).info("stop");
        timer.cancel();
        clearTimer();
      }
      `
    },
    {
      documentation: 'Monitor for consensus stalls',
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      // logger.info("execute");
      PM pm = PM.create(x, this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      DaggerService dagger = (DaggerService) x.get("daggerService");
      EventRecord er = getEventRecord();

      try {
        // First invocation
        if ( getLastIndex() == 0L ) {
          setLastIndex(replaying.getIndex());
          setLastIndexSince(System.currentTimeMillis());
          return;
        }

        // Movement
        if ( getLastIndex() != replaying.getIndex() ) {
          // logger.debug("skip", getLastIndex(), replaying.getIndex());
          setLastIndex(replaying.getIndex());
          setLastIndexSince(System.currentTimeMillis());
          if ( er.getSeverity() == LogLevel.WARN ) {
            er.setSeverity(LogLevel.INFO);
            er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
            er.clearId();
            setEventRecord(er);
          }
          return;
        }

        // Idle
        if ( replaying.getIndex() == dagger.getGlobalIndex(x) ) {
          setLastIndex(replaying.getIndex());
          setLastIndexSince(System.currentTimeMillis());
          if ( er.getSeverity() == LogLevel.WARN ) {
            er.setSeverity(LogLevel.INFO);
            er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
            er.clearId();
            setEventRecord(er);
          }
          return;
        }

        // TOOD: getMinReplayInterval has to be adjusted based on count.
        // Nodes with multiple mediator requests are constrained on memory and
        // 1m records might take 10 minutes to read and send.
        // note bootstrap entries are promoted with zero count.
        long delta = System.currentTimeMillis() - getLastIndexSince();
        if ( delta >= getMinReplayInterval() ) {

          DAO medusaDAO = (DAO) x.get(getMedusaDAO());
          Long nextIndex = replaying.getIndex() + 1;
          MedusaEntry next = (MedusaEntry) medusaDAO.find(nextIndex);
          if ( next != null ) {
            logger.warning("stalled", next.toSummary(), "consensus", next.getConsensusCount(), "of", support.getNodeQuorum(), "nodes", Arrays.toString(next.getConsensusNodes()), "since", new java.util.Date(getLastIndexSince()));
            if ( er.getSeverity() == LogLevel.INFO ) {
              er.setSeverity(LogLevel.WARN);
              er.setMessage("Stalled: "+next.toSummary());
              er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
              er.clearId();
              setEventRecord(er);
            }
          } else {
            logger.warning("stalled", getLastIndex(), "since", new java.util.Date(getLastIndexSince()));
            if ( er.getSeverity() == LogLevel.INFO ) {
              er.setSeverity(LogLevel.WARN);
              er.setMessage("Stalled: "+nextIndex);
              er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
              er.clearId();
              setEventRecord(er);
            }
          }

          logger.info("stalled,request replay");
          ReplayRequestCmd cmd = new ReplayRequestCmd();
          // request parents as well to handle 'parent not found' scenario
          long min = replaying.getIndex();
          if ( next != null ) {
            min = Math.min(next.getIndex(), Math.min(next.getIndex1(), next.getIndex2()));
          }
          cmd.setDetails(new ReplayDetailsCmd.Builder(x).setMinIndex(min).build());
          setLastIndexSince(System.currentTimeMillis());
          ((DAO) x.get("localClusterConfigDAO")).cmd(cmd);
        } else {
          logger.info("potentially stalled,waiting", getMinReplayInterval() - delta);
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
