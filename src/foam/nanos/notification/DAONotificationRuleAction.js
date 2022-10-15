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
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.notification.Notification',
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

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Map args = new HashMap();

      args.put("of", obj.getClass().getSimpleName());
      args.put("dop", rule.getOperation());

      if ( obj instanceof CreatedAware ) {
        args.put("created", ((CreatedAware)obj).getCreated());
      }
      if ( obj instanceof CreatedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((CreatedByAware)obj).getCreatedBy());
        args.put("createdBy", user.getLegalName());
      }
      if ( obj instanceof LastModifiedAware ) {
        args.put("lastModified", ((LastModifiedAware)obj).getLastModified());
      }
      if ( obj instanceof LastModifiedByAware ) {
        User user = (User) ((DAO) x.get("userDAO")).find(((LastModifiedByAware)obj).getLastModifiedBy());
        args.put("lastModifiedByBy", user.getLegalName());
      }

      args.put("summary", obj);

      StringBuilder sb = new StringBuilder();
      sb.append(obj.getClass().getSimpleName());
      sb.append(" ");
      sb.append(rule.getOperation());
      sb.append(" ");
      sb.append(obj);

      Notification notification = new Notification.Builder(x)
        .setBody(sb.toString())
        .setEmailArgs(args)
        .setSpid(rule.getSpid())
        .setTemplate(getNotificationTemplate())
        .setEmailName(getEmailTemplate())
        .build();
      ((DAO) ruler.getX().get("localNotificationDAO")).put_(x, notification);
      `
    }
  ]
});
