/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming.test',
  name: 'CandlestickAlarmTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.CandlestickAlarm',
    'foam.nanos.analytics.DAOReduceManager',
    'foam.nanos.om.OMLogger',
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      String name = "CandlestickAlarmTest";
      CandlestickAlarm ca = new CandlestickAlarm.Builder(x)
        .setId(name)
        .setKey(name)
        .setPercentageChange(1L)
        .build();
      ca = (CandlestickAlarm) ((DAO) x.get("candlestickAlarmDAO")).put(ca);
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, ca.getAlarmName()));
      if ( alarm != null &&
           alarm.getIsActive() ) {
        alarm = (Alarm) alarm.fclone();
        alarm.setIsActive(false);
        alarmDAO.put(alarm);
      }

      OMLogger om = (OMLogger) x.get("OMLogger");
      om.log(name);
      DAOReduceManager m = (DAOReduceManager) x.get("om5MinuteReduceManager");
      m.doReduce();
      for ( int i = 0; i <= 1000; i++ ) {
        om.log(name);
      }
      m.doReduce();
      alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, ca.getAlarmName()));
      test(alarm != null && alarm.getIsActive(), "Alarm generated");
      `
    }
  ]
});
