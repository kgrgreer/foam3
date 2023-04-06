/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingDAO',
  extends: 'foam.nanos.medusa.BlockingDAO',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: `All DAO operations will block until Replay is complete.`,

  javaImports: [
    'foam.core.AgencyTimerTask',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.mlang.sink.Count',
    'foam.nanos.pm.PM',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.time.Duration',
    'java.util.Map',
    'java.util.Timer',
  ],

  properties: [
    {
      name: 'timerInterval',
      class: 'Long',
      units: 'ms',
      value: 1000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      units: 'ms',
      value: 60000
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
      name: 'cmd_',
      javaCode: `
      if ( obj != null &&
           obj instanceof ReplayCompleteCmd ) {
        synchronized (this) {
          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          if ( replaying.getReplaying() ) {
            Logger logger = Loggers.logger(x, this);
            logger.info("replay complete");
            replaying.setReplaying(false);
            replaying.setEndTime(new java.util.Date());
            ((foam.nanos.om.OMLogger) x.get("OMLogger")).log("medusa.replay.end");
            // count medusa entries, how many did we load?
            Count count = new Count();
            ((DAO) x.get("medusaEntryDAO")).select(count);
            Long replayed = 0L;
            Map replayDetails = replaying.getReplayDetails();
            for ( Object o : replayDetails.values() ) {
              ReplayDetailsCmd details = (ReplayDetailsCmd) o;
              replayed += details.getCount();
            }
            replaying.setCount(replayed);
            long time = Math.max(1, (replaying.getEndTime().getTime() - replaying.getStartTime().getTime())/1000);
            Duration duration = Duration.ofMillis(time);
            ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

            ClusterConfig config = support.getConfig(x, support.getConfigId());
            StringBuilder sb = new StringBuilder();
            sb.append("replayed,").append(replayed).append(",promoted,").append(count.getValue()).append(",duration,").append(time).append(",s,").append(replayed/time).append(",/s,").append(duration);
            ((DAO) x.get("eventRecordDAO")).put_(x, new EventRecord(x, this, "replayComplete", config.getId(), null, sb.toString(), LogLevel.INFO, null));
            config.setStatus(Status.ONLINE);
            ((DAO) x.get("localClusterConfigDAO")).put(config);
          }
        }
        return super.cmd_(x, BlockingDAO.UNBLOCK_CMD);
      } else {
        return super.cmd_(x, obj);
      }
      `
    },
    {
      name: 'maybeBlock',
      javaCode: `
      ElectoralService electoral = (ElectoralService) x.get("electoralService");
      ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      ClusterConfig myConfig = support.getConfig(x, support.getConfigId());

      boolean block = false;

      if ( replaying.getReplaying() ) {
        block = true;
      } else if ( myConfig.getStatus() == Status.OFFLINE &&
           myConfig.getIsPrimary() ) {
        block = true;
      } else if ( electoral.getState() != ElectoralServiceState.IN_SESSION ) {
        try {
          support.getPrimary(x);
        } catch (PrimaryNotFoundException e) {
          block = true;
        }
      }

      if ( block ) {
        // Just log when blocking to monitor primary announce/renounce periods.
        Loggers.logger(x, this).debug("maybeBlock", "replaying", replaying.getReplaying(), "electoral", electoral.getState(), "primary", myConfig.getIsPrimary(), "status", myConfig.getStatus(), "blocked", getBlockedCount());
      }

      return block;
      `
    },
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      ClusterConfigSupport support = (ClusterConfigSupport) getX().get("clusterConfigSupport");
      Timer timer = new Timer(this.getClass().getSimpleName());
      setTimer(timer);
      timer.schedule(
        new AgencyTimerTask(getX(), support.getThreadPoolName(), this),
        getInitialTimerDelay(), getTimerInterval());
      `
    },
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
      unblock(x);
      `
    }
  ]
});
