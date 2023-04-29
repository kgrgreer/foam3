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
      value: 30000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      units: 'ms',
      value: 300000
    },
    {
      documentation: 'A second replay on the same index will not occur until at least minReplayInterval has past',
      name: 'minReplayInterval',
      class: 'Long',
      units: 'ms',
      value: 300000
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
      setLastReplay(System.currentTimeMillis());
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
      // NOTE: this keeps running if promoter exits.
      documentation: 'Monitor for consensus stalls',
      name: 'execute',
      args: 'Context x',
      javaCode: `
      Logger logger = Loggers.logger(x, this);
      // logger.info("execute");
      PM pm = PM.create(x, this.getClass().getSimpleName());
      ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");

      try {
        EventRecord er = getEventRecord();
        if ( er == null ) {
          er = new EventRecord(x, this, EVENT_NAME);
          setEventRecord(er);
        }

        if ( getLastIndex() == 0L ) {
          setLastIndex(replaying.getIndex());
          setLastIndexSince(System.currentTimeMillis());
          return;
        }

        if ( getLastIndex() != replaying.getIndex() ) {
          logger.debug("execute", "skip", getLastIndex(), replaying.getIndex());
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

        DAO medusaDAO = (DAO) x.get(getMedusaDAO());
        Long nextIndex = replaying.getIndex() + 1;
        MedusaEntry next = (MedusaEntry) medusaDAO.find(nextIndex);
        if ( next == null ) {
          if ( getLastIndex() != replaying.getIndex() ) {
            setLastIndex(replaying.getIndex());
            setLastIndexSince(System.currentTimeMillis());
            return;
          }
          if ( ! replaying.getReplaying() ) {
            if ( er.getSeverity() == LogLevel.WARN ) {
              er.setSeverity(LogLevel.INFO);
              er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
              er.clearId();
              setEventRecord(er);
            }
            return;
          }
        } else if ( next.getPromoted() ) {
          setLastIndex(nextIndex);
          setLastIndexSince(System.currentTimeMillis());
          if ( er.getSeverity() == LogLevel.WARN ) {
            er.setSeverity(LogLevel.INFO);
            er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
            er.clearId();
            setEventRecord(er);
          }
          return;
        } else {
          // not null, not promoted, and in this state for at least a timer cycle
          logger.warning("not promoted", next.getConsensusCount(), "of", support.getNodeQuorum(), "on", next.toSummary(), "nodes", Arrays.toString(next.getConsensusNodes()), "since", new java.util.Date(getLastIndexSince()));
          if ( er.getSeverity() == LogLevel.INFO ) {
            er.setSeverity(LogLevel.WARN);
            er.setMessage("Not promoted: "+next.toSummary());
            er = (EventRecord) ((DAO) x.get("eventRecordDAO")).put(er).fclone();
            er.clearId();
            setEventRecord(er);
          }
        }

        // REVIEW: currently experiencing replay issues whereby the first
        // entry is sent by the nodes, but not processed by the mediators.
        // The appear to recieve 'almost' all data. Then wait for this monitor
        // timeout to re-request replay.
        // Attempting here to re-request sooner if 'almost' all the data has been
        // received.
        Max max = (Max) medusaDAO.select(MAX(MedusaEntry.INDEX));
        MedusaEntry maxEntry = (MedusaEntry) medusaDAO.find((Long) max.getValue());
        if ( maxEntry != null &&
             maxEntry.getConsensusNodes().length > 1 ) {
          logger.debug("maxEntry", maxEntry, "count", maxEntry.getConsensusNodes().length);
        }

        // TOOD: getMinReplayInterval has to be adjusted based on count.
        // Nodes with multiple mediator requests are constrained on memory and
        // 1m records might take 10 minutes to read and send.
        // note bootstrap entries are promoted with zero count.
        if ( ( maxEntry != null &&
               ( maxEntry.getConsensusNodes().length > 1 ||
                 maxEntry.getPromoted() ) && // bootstrap entries are promoted with zero count.
               maxEntry.getIndex() >= replaying.getReplayIndex() ) ||
             System.currentTimeMillis() - getLastReplay() >= getMinReplayInterval() ) {
          logger.info("request replay");
          ReplayRequestCmd cmd = new ReplayRequestCmd();
          // request parents as well to handle 'parent not found' scenario
          long min = 0;
          if ( next != null ) {
            min = Math.min(next.getIndex(), Math.min(next.getIndex1(), next.getIndex2()));
          }
          cmd.setDetails(new ReplayDetailsCmd.Builder(x).setMinIndex(min).build());
          setLastReplay(System.currentTimeMillis());
          ((DAO) x.get("localClusterConfigDAO")).cmd(cmd);
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
