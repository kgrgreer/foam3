/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordAlarmRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `Generate or clear Alarm`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.util.StringUtil'
  ],

  properties: [
    {
      documentation: 'Severity at or above this value will generate an alarm',
      name: 'alarmSeverity',
      class: 'Enum',
      of: 'foam.log.LogLevel',
      value: 'WARN'
    }
  ],
  methods: [
    {
      name: 'applyAction',
      javaCode: `
      EventRecord er = (EventRecord) obj;

      // NOTE: use localAlarmDAO, as alarmDAO will generate notification.
      DAO alarmDAO = (DAO) ruler.getX().get("localAlarmDAO");
      String name = er.toSummary();
      Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME, name));
      if ( er.getSeverity().getOrdinal() >= LogLevel.WARN.getOrdinal() ) {
        if ( alarm == null ) {
          alarm = new Alarm(name);
          alarm.setSeverity(er.getSeverity());
          alarm.setNote(er.getMessage());
          alarm.setClusterable(er.getClusterable());
        } else {
          alarm = (Alarm) alarm.fclone();
        }
        if ( ! alarm.getIsActive() ) {
          alarm.setIsActive(true);
        }
        alarmDAO.put(alarm);
      } else if ( alarm != null &&
                  alarm.getIsActive() ) {
        alarm = (Alarm) alarm.fclone();
        alarm.setIsActive(false);
        alarmDAO.put(alarm);
      }
      `
    }
  ]
});
