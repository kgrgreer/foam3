/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AddAlarmNameDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `DAO that add name to alarmConfig on Alarm.put. Used to help keep truck of
  newly added alarms.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm alarm = (Alarm) obj;
      DAO configDAO = (DAO) x.get("alarmConfigDAO");
      AlarmConfig config = (AlarmConfig) configDAO.find(alarm.getName());
      if ( config != null ) {
        if ( ! config.getEnabled() ) {
          return alarm;
        }
        alarm.setSeverity(config.getSeverity());
      } else if ( alarm.getClusterable() ) {
        config = new AlarmConfig();
        config.setName(alarm.getName());
        config.setSeverity(alarm.getSeverity());
        config.setClusterable(alarm.getClusterable());
        try {
          configDAO.put(config);
        } catch ( Exception e ) {
          ((Logger) x.get("logger")).error(e);
        }
      }
      return getDelegate().put_(x, alarm);
      `
    }
  ]
});
