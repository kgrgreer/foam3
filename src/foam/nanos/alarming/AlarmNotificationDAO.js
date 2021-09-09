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
    'foam.nanos.auth.ServiceProviderAware',
    'foam.nanos.notification.email.EmailTemplateSourceEnum',
    'foam.nanos.notification.Notification',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'java.util.HashMap'
  ],

  properties: [
    {
      name: 'notificationTemplate',
      class: 'String',
      value: 'NOC'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      Alarm old = (Alarm) getDelegate().find_(x, ((Alarm)obj).getId());
      Alarm alarm = (Alarm) getDelegate().put_(x, obj);
      if ( ( old != null &&
             old.getIsActive() == alarm.getIsActive() ) ||
           ( ( old == null ||
               old.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) &&
               alarm.getSeverity().getOrdinal() < LogLevel.WARN.getOrdinal() ) ) {
        return alarm;
      }

      if ( "localhost".equals(System.getProperty("hostname", "localhost")) ) {
        return alarm;
      }

      // TODO: Occuring from medusa during replay
      if ( alarm.getCreated() ==  null ) {
        alarm = (Alarm) alarm.fclone();
        alarm.setCreated(new java.util.Date());
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
      body.append("\\nhost: ");
      body.append(alarm.getHostname());
      body.append("\\nstarted: ");
      body.append(alarm.getCreated().toString());
      body.append("\\ncleared: ");
      if ( ! alarm.getIsActive() ) {
        body.append(alarm.getLastModified().toString());
      }
      body.append("\\ninfo: ");
      body.append(alarm.getNote());

      HashMap args = new HashMap();
      args.put("alarm.name", alarm.getName());
      args.put("alarm.status", alarm.getIsActive() ? "Active" : "Cleared");
      args.put("alarm.severity", alarm.getSeverity().getLabel().toUpperCase());
      args.put("alarm.host", alarm.getHostname());
      args.put("alarm.started", alarm.getCreated().toString());
      args.put("alarm.cleared", alarm.getIsActive() ? "" : alarm.getLastModified().toString());
      args.put("alarm.note", alarm.getNote());
      args.put("templateSource", this.getClass().getName());
      args.put("templateSourceType", EmailTemplateSourceEnum.SERVICE_SOURCE.getLabel());

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
        .setToastMessage(alarm.getName())
        .build();

     ((DAO) x.get("localNotificationDAO")).put_(getX(), notification);
      return alarm;
      `
    }
  ]
});
