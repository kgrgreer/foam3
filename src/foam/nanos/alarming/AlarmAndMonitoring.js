foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmAndMonitoring',

  documentation: 'Raises an alarm if certain conditions are met',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Date',
    'java.util.Calendar',
    'java.util.TimeZone',
    'foam.nanos.analytics.Candlestick',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO configDAO = (DAO) x.get("alarmConfigDAO");
          MonitoringReport report = (MonitoringReport) obj;
          AlarmConfig config = (AlarmConfig) configDAO.find(report.getName());

          if ( config == null || ! config.getEnabled() ) {
            return;
          }

          DAO omDAO = (DAO) ( config.getUseCCOMLogger() ? x.get("localCcom1MinuteDAO") : x.get("om1MinuteDAO") );
          if ( omDAO == null ) {
            // Force OM DAO if CCOM DAO is not enabled
            omDAO = (DAO) x.get("om1MinuteDAO");
          }

          Date currentCloseTime = new Date();
          currentCloseTime.setSeconds(0);

          Candlestick receiveResponses = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getPostRequest())
          );
          Candlestick sentRequest = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getPreRequest())
          );

          Candlestick timeout = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
            EQ(Candlestick.KEY, config.getTimeOutRequest())
          );

          boolean newAlarm = false;
          DAO alarmDAO = (DAO) x.get("alarmDAO");
          Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, config.getName()));
          if ( alarm == null ) {
            alarm = new Alarm.Builder(x)
              .setName(config.getName())
              .setIsActive(false)
              .build();
            newAlarm = true;
          } else {
            alarm = (Alarm) alarm.fclone();
          }

          boolean updateAlarm = false;

          // check to see if the sent candlestick is the latest one
          if ( sentRequest != null && Math.abs(sentRequest.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime() ) {
            updateAlarm = true;
            report.setStartCount(report.getStartCount() + (int) sentRequest.getCount());
          }
          // check to see if the response candlestick is the latest one
          if ( receiveResponses != null && Math.abs(receiveResponses.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime() ) {
              updateAlarm = true;
              report.setEndCount(report.getEndCount() + (int) receiveResponses.getCount());
          }
          if ( config.getMonitorType() == MonitorType.CREDENTIALS  && updateAlarm ) {
            alarm = AlarmAndMonitoring.this.checkCredentials(x, config, report, alarm);
            alarmDAO.put(alarm);
            return;
          }
          if ( timeout != null && (Math.abs(timeout.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime()) ) {
              updateAlarm = true;
              report.setTimeoutCount(report.getTimeoutCount() + (int) timeout.getCount());
          }

          float timeoutCount = timeout != null ? timeout.getCount() : 0;
          float sentCount = sentRequest != null ? sentRequest.getCount() : 0;
          float responseCount = receiveResponses != null ? receiveResponses.getCount() : 0;

          if ( ! updateAlarm || (newAlarm && sentCount == responseCount) ) {
            return;
          }

          if ( timeoutCount > 0 && sentCount > 0  && (timeoutCount / sentCount) > (float) config.getTimeoutValue() / 100 ) {
            if ( ! alarm.getIsActive() || !( alarm.getReason() == AlarmReason.TIMEOUT) ) {
              alarm.setReason(AlarmReason.TIMEOUT);
              alarm.setIsActive(true);
            }
          } else if (( config.getMonitorType() == MonitorType.CONTROLCHECK ||
                      config.getMonitorType() == MonitorType.CONGESTION ) &&
                      sentCount > 0  &&
                      (responseCount / sentCount) < (float) config.getAlarmValue() / 100 ) {
            AlarmReason checkReason = config.getMonitorType() == MonitorType.CONTROLCHECK ? AlarmReason.CONTROLCHECK : AlarmReason.CONGESTION;

            if ( ! alarm.getIsActive() || !( alarm.getReason() == checkReason ) ) {
              alarm.setReason(checkReason);
              alarm.setIsActive(true);
            }
          } else if ( config.getMonitorType() == MonitorType.THRESHOLD && sentCount > config.getAlarmValue() ) {
            if ( ! alarm.getIsActive() ) {
              alarm.setReason(AlarmReason.THRESHOLD);
              alarm.setIsActive(true);
            }
          } else {
            if ( alarm.getIsActive() ) {
              report.setStartCount(0);
              report.setEndCount(0);
              report.setTimeoutCount(0);
              alarm.setReason(AlarmReason.UNSPECIFIED);
              alarm.setIsActive(false);
            }
          }

          // Have to do this manually as not all alarms modify the state and therefore lastModifiedAware decorator will not update lastModified
          alarm.setLastModified(new Date());

          alarmDAO.put(alarm);
        }
      }, "Alarm And Monitoring");
      `
    },
    {
      name: 'checkCredentials',
      type: 'foam.nanos.alarming.Alarm',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'foam.nanos.alarming.AlarmConfig',
          name: 'config'
        },
        {
          type: 'foam.nanos.alarming.MonitoringReport',
          name: 'report',
        },
        {
          type: 'foam.nanos.alarming.Alarm',
          name: 'alarm'
        }
      ],
      javaCode: `
      if ( report.getStartCount() != 0  && report.getEndCount() != 0  && ((float) report.getEndCount() /(float) report.getStartCount()) < (float) config.getAlarmValue() / 100 ) {
        if ( ! alarm.getIsActive() || !( alarm.getReason() == AlarmReason.CREDENTIALS) ) {
          alarm.setReason(AlarmReason.CREDENTIALS);
          alarm.setIsActive(true);
        }
      }  else if ( report.getStartCount() != 0  && report.getEndCount() == 0  ) {
        alarm.setReason(AlarmReason.CREDENTIALS);
        alarm.setIsActive(true);
      } else {
        if ( alarm.getIsActive() ) {
          report.setStartCount(0);
          report.setEndCount(0);
          report.setTimeoutCount(0);
          alarm.setReason(AlarmReason.UNSPECIFIED);
          alarm.setIsActive(false);
        }
      }
      return alarm;
      `
    }
  ]

});
