/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.cron',
  name: 'CronScheduler',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.NanoService'
  ],

  documentation: ``,

  javaImports: [
    'foam.core.Agency',
    'foam.core.AgencyTimerTask',
    'foam.core.ContextAwareSupport',
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.dao.AbstractDAO',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.MapDAO',
    'foam.dao.Sink',
    'foam.log.LogLevel',
    'foam.mlang.MLang',
    'foam.mlang.sink.Min',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.NanoService',
    'foam.nanos.script.ScriptStatus',
    'java.util.Date',
    'java.util.Timer'
  ],

  properties: [
    {
      name: 'cronDelay',
      class: 'Long',
      value: 5000
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000
    },
    {
      name: 'cronDAO',
      class: 'String',
      value: 'cronDAO',
    },
    {
      name: 'cronJobDAO',
      class: 'String',
      value: 'localCronJobDAO'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      documentation: 'NanoService implementation.',
      name: 'start',
      javaCode: `
      Loggers.logger(getX(), this).info("start");
      Timer timer = new Timer(this.getClass().getSimpleName());
      timer.schedule(
        new AgencyTimerTask(getX(), this),
        getInitialTimerDelay());
      `
    },
    {
      documentation: 'Get the minimum scheduled cron job',
      name: 'getMinScheduledTime',
      type: 'DateTime',
      javaCode: `
    Min min = (Min) ((DAO) getX().get(getCronJobDAO()))
      .where(MLang.EQ(Cron.ENABLED, true))
      .select(MLang.MIN(Cron.SCHEDULED_TIME));

    if ( min.getValue().equals(0) ) {
      return null;
    }

    return (Date) min.getValue();
      `
    },
    {
      name: 'execute',
      javaCode: `
    final Logger logger = Loggers.logger(x, this);
    try {
      // Wait until Medusa Replay is complete
      foam.nanos.medusa.MedusaSupport support = (foam.nanos.medusa.MedusaSupport) x.get("medusaSupport");
      if ( support != null &&
           support.isReplaying(x) ) {
        logger.debug("execute", "replaying");
        Timer timer = new Timer(this.getClass().getSimpleName());
        timer.schedule(
          new AgencyTimerTask(x, this),
          getInitialTimerDelay());
        return;
      }

      logger.info("initialize", "cronjobs", "start");
      // copy all entries to from cronjob to localCronDAO for execution
      final DAO cronDAO = (DAO) getX().get(getCronDAO());
      final DAO cronJobDAO = (DAO) getX().get(getCronJobDAO());
      cronDAO.where(MLang.EQ(Cron.ENABLED, true)).
        select(new Sink() {
          public void put(Object obj, Detachable sub) {
            Cron cron = (Cron) ((FObject) obj).fclone();
            cron.setScheduledTime(cron.getNextScheduledTime(getX()));
            cronJobDAO.put(cron);
          }
          public void remove(Object obj, Detachable sub) {}
          public void eof() {}
          public void reset(Detachable sub) {}
        });
      logger.info("initialize", "cronjobs", "complete");

      while ( true ) {
        if ( getEnabled() ) {
          Date now = new Date();
          cronJobDAO.where(
                         MLang.AND(
                                   MLang.LTE(Cron.SCHEDULED_TIME, now),
                                   MLang.EQ(Cron.ENABLED, true),
                                   MLang.IN(Cron.STATUS, new ScriptStatus[] {
                                                          ScriptStatus.UNSCHEDULED,
                                                          ScriptStatus.ERROR,
                                     })
                                   )
                         )
            .orderBy(Cron.SCHEDULED_TIME)
            .select(new AbstractSink() {
                             @Override
                             public void put(Object obj, Detachable sub) {
                               Cron cron = (Cron) ((FObject) obj).fclone();
                               try {
                                 if ( cron.canRun(x) ) {
                                   cron.setStatus(ScriptStatus.SCHEDULED);
                                   cronJobDAO.put_(x, cron);
                                 }
                               } catch (Throwable t) {
                                 logger.error("Unable to schedule cron job", cron.getId(), t.getMessage(), t);
                                 Alarm alarm = new Alarm("CronScheduler - Unabled to schedule");
                                 alarm.setSeverity(LogLevel.ERROR);
                                 alarm.setReason(AlarmReason.CONFIGURATION);
                                 alarm.setNote(cron.getId()+"\\n"+t.getMessage());
                                 ((DAO) x.get("alarmDAO")).put(alarm);
                               }
                             }
                           });
        }
        // Check for new cronjobs every 5 seconds if no current jobs
        // or if their next scheduled execution time is > 5s away
        // Delay at least a little bit to avoid blocking in case of a script error.
        long delay = getCronDelay();
        Date minScheduledTime = getMinScheduledTime();
        if( minScheduledTime != null &&
            getEnabled() ) {
          delay = Math.abs(minScheduledTime.getTime() - System.currentTimeMillis());
          delay = Math.min(getCronDelay(), delay);
          delay = Math.max(500, delay);
        }
        Thread.sleep(delay);
      }
    } catch (Throwable t) {
      logger.error(t.getMessage(), t);
      ((DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm.Builder(x)
        .setName("CronScheduler")
        .setSeverity(foam.log.LogLevel.ERROR)
        .setNote(t.getMessage())
        .build());
    }
    `
    }
  ]
});
