/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'HealthHeartbeatMonitor',

  documentation: 'Mark system unhealthy if # heartbeats missed.',

  implements: [
    'foam.core.ContextAgent',
    'foam.core.ContextAware',
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'foam.core.Agency',
    'foam.core.ContextAgentTimerTask',
    'foam.core.ContextAgent',
    'foam.core.Detachable',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'java.util.Timer'
  ],

  properties: [
    {
      documentation: 'Set status to MAINT if this many heartbeats are missed.',
      name: 'missed',
      class: 'Int',
      value: 2
    },
    {
      name: 'unhealthyStatus',
      class: 'Enum',
      of: 'foam.nanos.app.HealthStatus',
      value: 'FAIL'
    },
    {
      name: 'timerInterval',
      class: 'Long',
      value: 2000,
      units: 'ms'
    },
    {
      name: 'initialTimerDelay',
      class: 'Long',
      value: 60000,
      units: 'ms'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      if ( "localhost".equals(System.getProperty("hostname", "localhost")) ) {
        Loggers.logger(getX(), this).info("start, disabled on localhost");
        return;
      }
      Loggers.logger(getX(), this).info("start");
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      timer.scheduleAtFixedRate(
        new ContextAgentTimerTask(getX(), this),
        getInitialTimerDelay(),
        getTimerInterval()
      );
      `
    },
    {
      name: 'execute',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      ((DAO) x.get("healthDAO")).select(
        new Sink() {
          public void put(Object obj, Detachable sub) {
            Health health = (Health) obj;
            if ( health.getHeartbeatTime() == 0 ) return;

            if ( health.getStatus() != HealthStatus.UP ) return;

            DAO alarmDAO = (DAO) x.get("alarmDAO");
            String name = "Heartbeat missed - "+health.toSummary();
            Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));

            long targetTime = health.getHeartbeatTime() +
              (getMissed() * health.getHeartbeatSchedule()) +
              health.getPropogationTime();

            if ( System.currentTimeMillis() > targetTime ) {
              logger.warning("heartbeat", "missed", health.getId());
              health = (Health) health.fclone();
              health.setStatus(getUnhealthyStatus());
              health.setUpTime(0L);
              ((DAO) x.get("healthDAO")).put_(x, health);

              if ( alarm != null ) {
                if ( ! alarm.getIsActive() ) {
                  alarm = (Alarm) alarm.fclone();
                  alarm.setIsActive(true);
                  alarmDAO.put(alarm);
                }
              } else {
                alarm = new Alarm(name);
                alarm.setSeverity(foam.log.LogLevel.INFO);
                alarm.setReason(AlarmReason.TIMEOUT);
                alarm.setClusterable(false);
                alarm.setNote("heartbeats missed "+health.toSummary());
                alarmDAO.put(alarm);
              }
            } else if ( alarm != null &&
                        alarm.getIsActive() ) {
              alarm = (Alarm) alarm.fclone();
              alarm.setIsActive(false);
              alarmDAO.put(alarm);
            }
          }

          public void remove(Object obj, Detachable sub) {}
          public void eof() {}
          public void reset(Detachable sub) {}
        }
      );
      `
    }
  ]
});
