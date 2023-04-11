/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordNotificationRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `Generate Notification`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.notification.Notification',
    'foam.util.StringUtil',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'notificationTemplate',
      class: 'String',
      value: 'foam-nanos-er-EventRecordNotificationTemplate'
    }
  ],

  javaCode: `
  protected static ThreadLocal<SimpleDateFormat> sdf_ = new ThreadLocal<SimpleDateFormat>() {
    @Override
    protected SimpleDateFormat initialValue() {
      SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
      return df;
    }
  };
  `,

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Map args = new HashMap();
      EventRecord er = (EventRecord) obj;

      args.put("of", er.getClass().getSimpleName());

      var props = er.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo prop : props ) {
        var value = prop.get(obj);
        if ( value != null ) {
          args.put(prop.getName(), value.toString());
        }
      }
      FObject fobj = er.getFObject();
      if ( fobj != null ) {
        String model = fobj.getClass().getSimpleName();
        props = fobj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
        for ( PropertyInfo prop : props ) {
          var value = prop.get(fobj);
          if ( value != null ) {
            args.put(model+"."+prop.getName(), value.toString());
          }
        }
      }

      if ( er instanceof CreatedAware ) {
        Date date = ((CreatedAware)er).getCreated();
        if ( date != null ) {
          args.put("created", sdf_.get().format(date));
        }
      }
      if ( er instanceof CreatedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((CreatedByAware)er).getCreatedBy());
        if ( user != null ) {
          args.put("createdBy", user.getLegalName());
        } else {
          // this can occur with repository provided entities
          args.put("createdBy", "");
        }
      }
      if ( er instanceof LastModifiedAware ) {
        Date date = ((LastModifiedAware)er).getLastModified();
        if ( date != null ) {
          args.put("lastModified", sdf_.get().format(date));
        }
      }
      if ( er instanceof LastModifiedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((LastModifiedByAware)er).getLastModifiedBy());
        args.put("lastModifiedBy", user.getLegalName());
      }
      args.put("summary", er.toSummary());
      args.put("eventRecord", er.getId());

      StringBuilder sb = new StringBuilder();
      sb.append(obj.getClass().getSimpleName());
      sb.append(" ");
      sb.append(rule.getOperation());
      sb.append(" ");
      sb.append(er.toSummary());
      sb.append(" ");
      AppConfig appConfig = (AppConfig) x.get("appConfig");
      sb.append(appConfig.getUrl());
      sb.append("/#er?id=");
      sb.append(er.getId());

      Notification notification = new Notification();
      notification.setBody(sb.toString());
      notification.setEmailArgs(args);
      notification.setSpid(rule.getSpid());
      notification.setTemplate(getNotificationTemplate());
      notification.setClusterable(er.getClusterable());
      ((DAO) ruler.getX().get("notificationDAO")).put_(ruler.getX(), notification);
      `
    }
  ]
});
