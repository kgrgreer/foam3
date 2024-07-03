/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification',
  name: 'DAONotificationRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `Generate Notification DAO operations`,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.util.StringUtil',
    'java.text.SimpleDateFormat',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'notificationTemplate',
      class: 'String'
    },
    {
      name: 'emailTemplate',
      class: 'String'
    },
    {
      name: 'group',
      class: 'Reference',
      of: 'foam.nanos.auth.Group'
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

      args.put("of", obj.getClass().getSimpleName());
      args.put("dop", rule.getOperation().getName());

      // add all properties of obj as args
      var props = obj.getClassInfo().getAxiomsByClass(PropertyInfo.class);
      for ( PropertyInfo prop : props ) {
        var value = prop.get(obj);
        if ( value != null ) {
          args.put(prop.getName(), value.toString());
        }
        if ( oldObj != null ) {
          var oldValue = prop.get(oldObj);
          if ( oldValue != null ) {
            args.put("old"+StringUtil.capitalize(prop.getName()), oldValue.toString());
          }
        }
      }

      if ( obj instanceof CreatedAware ) {
        Date date = ((CreatedAware)obj).getCreated();
        if ( date != null ) {
          args.put("created", sdf_.get().format(date));
        }
      }
      if ( obj instanceof CreatedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((CreatedByAware)obj).getCreatedBy());
        if ( user != null ) {
          args.put("createdBy", user.getLegalName());
        } else {
          // this can occur with repository provided entities
          args.put("createdBy", "");
        }
      }
      if ( obj instanceof LastModifiedAware ) {
        Date date = ((LastModifiedAware)obj).getLastModified();
        if ( date != null ) {
          args.put("lastModified", sdf_.get().format(date));
        }
      }
      if ( obj instanceof LastModifiedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((LastModifiedByAware)obj).getLastModifiedBy());
        args.put("lastModifiedBy", user.getLegalName());
      }

      args.put("summary", ((FObject)obj).toSummary());

      StringBuilder sb = new StringBuilder();
      sb.append(obj.getClass().getSimpleName());
      sb.append(" ");
      sb.append(rule.getOperation());
      sb.append(" ");
      sb.append(obj);

      Notification notification = new Notification();
      notification.setBody(sb.toString());
      notification.setEmailArgs(args);
      notification.setSpid(rule.getSpid());
      if ( ! foam.util.SafetyUtil.isEmpty(getGroup()) ) notification.setGroupId(getGroup());
      notification.setTemplate(getNotificationTemplate());
      notification.setEmailName(getEmailTemplate());
      ((DAO) ruler.getX().get("notificationDAO")).put_(ruler.getX(), notification);
      `
    }
  ]
});
