foam.CLASS({
  package: 'net.nanopay.onboarding.ruler',
  name: 'NotificationSettingsRule',

  documentation: `Creates default notification settings on user create`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.EmailSetting',
    'foam.nanos.notification.NotificationSetting',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            NotificationSetting notificationSetting = new NotificationSetting();
            EmailSetting emailSetting = new EmailSetting();
            try {
              user.getNotificationSettings(x).put(notificationSetting);
              if ( ! ( user instanceof Business ) ) {
                user.getNotificationSettings(x).put(emailSetting);
              }
            } catch ( Exception e ) {
              Logger logger = (Logger) x.get("logger");
              logger.error("Failed to create notification settings for " + user.getId() + ":" + e);
            }
          }
        },"Create default notification settings");
      `
    }
  ]
});
