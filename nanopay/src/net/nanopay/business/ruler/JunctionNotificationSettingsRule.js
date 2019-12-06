foam.CLASS({
  package: 'net.nanopay.business.ruler',
  name: 'JunctionNotificationSettingsRule',

  documentation: `Creates default notification settings on agentJunction create`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.EmailSetting',
    'foam.nanos.notification.NotificationSetting',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserUserJunction userUserJunction = (UserUserJunction) obj;
            NotificationSetting notificationSetting = new NotificationSetting();
            EmailSetting emailSetting = new EmailSetting();
            try {
              userUserJunction.getNotificationSettingsForUserUsers(x).put(notificationSetting);
              userUserJunction.getNotificationSettingsForUserUsers(x).put(emailSetting);
            } catch ( Exception e ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Failed to create notification settings for " + "src:" + userUserJunction.getSourceId() + " target:" + userUserJunction.getTargetId() + ":" + e);
            }
          }
      },"Create junction notification setting");
      `
    }
  ]
});
