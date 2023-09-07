/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'HealthRemoveDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm'
  ],

  methods: [
    {
      documentation: 'on remove, remove any associated alarms',
      name: 'remove_',
      javaCode: `
      getDelegate().remove_(x, obj);
      Health health = (Health) obj;
      String name = "Heartbeat missed - "+health.toSummary();
      DAO alarmDAO = (DAO) x.get("alarmDAO");
      Alarm alarm = (Alarm) alarmDAO.find(name);
      if ( alarm != null ) {
        if ( alarm.getIsActive() ) {
          alarm = (Alarm) alarm.fclone();
          alarm.setIsActive(false);
          alarm = (Alarm) alarmDAO.put_(x, alarm);
        }
        alarm = (Alarm) alarmDAO.remove_(x, alarm);
      }
      return health;
      `
    }
  ]
})
