foam.CLASS({
  package: 'net.nanopay.sme.ruler',
  name: 'AccessControlChangeNotificationRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Send notifications when access control change on user management`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.notification.Notification',
    'java.util.HashMap'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            //DAO junction = (DAO) x.get("agentJunctionDAO");
            DAO userDAO               = (DAO) x.get("userDAO");
            UserUserJunction junction = (UserUserJunction) obj;
            User user                 = (User) userDAO.find(junction.getSourceId());
            User business             = (User) userDAO.find(junction.getTargetId());
            AppConfig config          = user.findGroup(x).getAppConfig(x);
            String groupName          = null;

            if ( junction.getGroup().contains(".employee") )
              groupName = "employee";
            else if ( junction.getGroup().contains(".admin") )
              groupName = "admin";

            HashMap<String, Object> args = new HashMap<>();
            args.put("userName",    user.getLegalName());
            args.put("groupName",  groupName);
            args.put("business", business.toSummary());
            args.put("sendTo", user.getEmail());
            args.put("link", config.getUrl());

            Notification accessControlNotification = new Notification.Builder(x)
              .setBody("Access control has been changed!")
              .setNotificationType("Access Control Change")
              .setEmailArgs(args)
              .setEmailName("access-control-change")
              .build();
            user.doNotify(x, accessControlNotification);
          }
        }, "Send notifications when access control change on user management.");
      `
    }
  ]
 });
