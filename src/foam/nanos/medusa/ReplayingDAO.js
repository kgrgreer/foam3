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
    'foam.nanos.app.AppConfig',
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
            ClusterConfigSupport support = (ClusterConfigSupport) x.get("clusterConfigSupport");

            ClusterConfig config = support.getConfig(x, support.getConfigId());
            AppConfig appConfig = (AppConfig) x.get("appConfig");

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
            double minutes = time / 60.0;
            double replayedS = replayed / (double) time;
            double promotedS = ((Long) count.getValue()) / (double) time;
            double min100K = minutes / ( (Long) count.getValue() / 100000.0 );

            StringBuilder report = new StringBuilder();
            report.append("instance,replayed,promoted,duration s,replayed/s,promoted/s,minutes,min/100K,app,java,date");
            report.append("\\n");
            report.append(System.getProperty("hostname", "loalhost"));
            report.append(",");
            report.append(replayed);
            report.append(",");
            report.append(count.getValue());
            report.append(",");
            report.append(time);
            report.append(",");
            report.append(String.format("%.2f", replayedS));
            report.append(",");
            report.append(String.format("%.2f", promotedS));
            report.append(",");
            report.append(String.format("%.2f", minutes));
            report.append(",");
            report.append(String.format("%.2f", min100K));
            report.append(",");
            report.append(appConfig.getVersion());
            report.append(",");
            report.append(String.valueOf(Runtime.version().version().get(0)));
            report.append(",");
            report.append(new java.util.Date(replaying.getStartTime().getTime()));

            logger.info("replayComplete", "report", "\\n"+report.toString());

            EventRecord er = new EventRecord(x, "Medusa", "replay", "complete");
            er.setResponseMessage(report.toString());
            ((DAO) x.get("eventRecordDAO")).put(er);

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
