/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmNotificationDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Generate Notification for WARN or ERROR Alarms.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.notification.Notification',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.util.AUIDGenerator',
    'foam.util.SafetyUtil',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'notificationTemplate',
      class: 'String',
      value: 'NOC'
    },
    {
      name: 'auid',
      class: 'FObjectProperty',
      of: 'foam.util.AUIDGenerator',
      javaFactory: `
        return new AUIDGenerator(getX(), "alarmDAO");
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm old = (Alarm) getDelegate().find_(x, ((Alarm)obj).getId());
      Alarm alarm = (Alarm) obj;
      if ( ( old != null &&
             old.getIsActive() == alarm.getIsActive() ) ||
           ( ( old == null ||
               old.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) &&
               alarm.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) ) {
        getDelegate().put_(x, obj);
      }

      if ( "localhost".equals(System.getProperty("hostname", "localhost")) &&
           ((AppConfig) x.get("appConfig")).getMode() != Mode.TEST ) {
        getDelegate().put_(x, obj);
      }

      if ( old == null ||
           ! old.getIsActive() && alarm.getIsActive() ) {
        // raise alarm
        // If alarm becomes active again, then requires new external id.
        alarm.setExternalId(getAuid().getNextString());
      } else if ( old.getIsActive() && ! alarm.getIsActive() ) {
        // clear alarm
        alarm.setExternalId(old.getExternalId());
      }
      alarm = (Alarm) getDelegate().put_(x, alarm);

      // TODO: Occuring from medusa during replay
      if ( alarm.getCreated() ==  null ) {
        alarm = (Alarm) alarm.fclone();
        alarm.setCreated(new java.util.Date());
        alarm = (Alarm) getDelegate().put_(x, alarm);
      }

      // create body for non-email notifications
      StringBuilder body = new StringBuilder();
      body.append("[");
      body.append(alarm.getHostname());
      body.append("] ");
      body.append(alarm.getSeverity().getLabel().toUpperCase());
      body.append(" - ");
      body.append(alarm.getName());
      body.append("\\nname: ");
      body.append(alarm.getName());
      body.append("\\nstatus: ");
      body.append(alarm.getIsActive() ? "Active": "Cleared");
      body.append("\\nseverity: ");
      body.append(alarm.getSeverity().getLabel());
      body.append("\\nreason: ");
      body.append(alarm.getReason().getLabel());
      body.append("\\nhost: ");
      body.append(alarm.getHostname());
      body.append("\\nstarted: ");
      body.append(alarm.getCreated().toString());
      if ( ! alarm.getIsActive() ) {
        body.append("\\ncleared: ");
        body.append(alarm.getLastModified().toString());
      }
      body.append("\\ninfo: ");
      body.append(alarm.getNote());
      if ( alarm.getEventRecord() != null ) {
        body.append("\\neventRecord: ");
        body.append("/#er?id="+alarm.getEventRecord());
      }

      HashMap args = new HashMap();
      args.put("alarm.name", alarm.getName());
      args.put("alarm.status", alarm.getIsActive() ? "Active" : "Cleared");
      args.put("alarm.severity", alarm.getSeverity().getLabel().toUpperCase());
      args.put("alarm.reason", alarm.getReason().getLabel());
      args.put("alarm.host", alarm.getHostname());
      args.put("alarm.started", alarm.getCreated().toString());
      if ( ! alarm.getIsActive() ) {
        args.put("alarm.cleared", alarm.getLastModified().toString());
      }
      args.put("alarm.note", alarm.getNote());
      if ( ! SafetyUtil.isEmpty(alarm.getEventRecord()) ) {
        args.put("alarm.eventRecord", alarm.getEventRecord());
      }

      // Notifications are ServiceProviderAware
      String spid = ServiceProviderAware.GLOBAL_SPID;
      Theme theme = ((Themes) x.get("themes")).findTheme(x);
      if ( theme != null &&
           ! foam.util.SafetyUtil.isEmpty(theme.getSpid()) ) {
        spid = theme.getSpid();
      }

      Notification notification = new Notification.Builder(x)
        .setBody(body.toString())
        .setClusterable(alarm.getClusterable())
        .setEmailArgs(args)
        .setEmailName("alarm")
        .setSeverity(alarm.getSeverity())
        .setSpid(spid)
        .setTemplate(getNotificationTemplate())
        .setAlarm(alarm)
        .build();

     ((DAO) x.get("localNotificationDAO")).put_(getX(), notification);
      return alarm;
      `
    }
  ]
});
