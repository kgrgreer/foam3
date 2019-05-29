foam.CLASS({
  package: 'net.nanopay.alarming',
  name: 'AlarmAndMonitoring',

  documentation: 'Raises an alarm if certain conditions are met',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.Date',
    'foam.nanos.analytics.Candlestick',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      DAO configDAO = (DAO) x.get("alarmConfigDAO");
      MonitoringReport report = (MonitoringReport) obj;
      AlarmConfig config = (AlarmConfig) configDAO.find(EQ(AlarmConfig.NAME, report.getName()));
      
      sendReceiveMonitoring(x, config);
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '// do nothing'
    },
    {
      name: 'canExecute',
      javaCode: 'return true;'
    },
    {
      name: 'describe',
      javaCode: 'return "";'
    },
    {
      name: 'sendReceiveMonitoring',
      type: 'void',
      args: [
        {
          type: 'Context',
          name: 'x',
        },
        {
          type: 'net.nanopay.alarming.AlarmConfig',
          name: 'config',
        }
      ],
      javaCode: `
      DAO omDAO = (DAO) x.get("om1minDAO");

      Date currentCloseTime = new Date();
      currentCloseTime.setSeconds(0);
      Candlestick receiveResponses = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
        EQ(Candlestick.KEY, config.getReceiveName())
      );

      Candlestick sentRequest = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
        EQ(Candlestick.KEY, config.getSendName())
      );
  
      Candlestick timeout = (Candlestick) omDAO.orderBy(new foam.mlang.order.Desc(Candlestick.CLOSE_TIME)).find(
        EQ(Candlestick.KEY, config.getTimeOutName())
      );

      DAO alarmDAO = (DAO) x.get("alarmDAO");
      Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, config.getName()));
      if ( alarm == null ) {
        alarm = new Alarm.Builder(x)
          .setName(config.getName())
          .setCreated(new Date())
          .setLastUpdated(new Date())
          .setIsActive(false)
          .build();
      } else {
        alarm = (Alarm) alarm.fclone();
      }

      if ( receiveResponses == null || sentRequest == null ){
        return;
      } else if ( timeout != null && (Math.abs(timeout.getCloseTime().getTime() - currentCloseTime.getTime()) < config.getCycleTime())) {
        alarm.setIsActive(true);
        alarm.setLastUpdated(new Date());
        alarm.setReason(AlarmReason.TIMEOUT);
        alarmDAO.put(alarm);
        return;
      } else if ( Math.abs(sentRequest.getCloseTime().getTime() - currentCloseTime.getTime()) > config.getCycleTime() ) {
        System.out.println("OLD DATA SKIP");
        return;
      } 
      
      // alarm checks
      if ( sentRequest.getCloseTime().compareTo(receiveResponses.getCloseTime()) != 0 ) {
        alarm.setIsActive(true);
        alarm.setReason(AlarmReason.MISSING_PAIR);
        System.out.println("MISSING 1 OF THE PAIR" + config.getName());
      } else if ( receiveResponses.getCount() / sentRequest.getCount()  < (float) config.getAlarmValue() / 100 ) {
        alarm.setIsActive(true);
        alarm.setReason(AlarmReason.SEND_RECEIVE_MISMATCH);
        System.out.println("SOUND THE ALARM FOR: " + config.getName());
      } else {
        alarm.setIsActive(false);
        alarm.setReason(AlarmReason.NONE);
      }
      alarm.setLastUpdated(new Date());
      alarmDAO.put(alarm);
      `
    }
  ]

});
