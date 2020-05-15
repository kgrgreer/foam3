foam.CLASS({
  package: 'net.nanopay.notification',
  name: 'TriggerNotificationTestAction',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'java.util.HashSet'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              User user = ((Subject) x.get("user")).getUser();

              DAO localUserDAO = (DAO) x.get("localUserDAO");
              DAO notificationDAO = (DAO) x.get("localNotificationDAO");

              Logger logger = (Logger) x.get("logger");
              logger.info("Sending notification to: " + user);

              StringBuilder sb = new StringBuilder(user.toSummary())
                .append(" is getting a test notification ");

              String notificationMsg = sb.toString();

              Notification notification = new Notification();
              notification.setUserId(user.getId());
              notification.setBody(notificationMsg);
              notification.setNotificationType("Test_Notification");
              try {
                notificationDAO.put_(x, notification);
              }
              catch (Exception e) {
                logger.error("Failed to put notification. " + e);
              }
            }
         },"Test notification");
      `
    }
  ]
});
