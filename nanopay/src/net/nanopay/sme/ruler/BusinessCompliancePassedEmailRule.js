foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'BusinessCompliancePassedEmailRule',

    documentation: `Sends email to signing officer after their business passes compliance.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.app.AppConfig',
      'foam.nanos.auth.Address',
      'foam.nanos.auth.Group',
      'foam.nanos.auth.User',
      'foam.nanos.logger.Logger',
      'foam.nanos.notification.Notification',
      'foam.nanos.notification.email.EmailMessage',
      'net.nanopay.model.Business',
      'java.util.HashMap',
      'java.util.Map',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Business business = (Business) obj;
            Address businessAddress = business.getAddress();

            if( ! businessAddress.getCountryId().equals("US") ){
              Logger                  logger       = (Logger) x.get("logger");
              Group                   group        = business.findGroup(x);
              AppConfig               appConfig    = group.getAppConfig(x);
              String                  url          = appConfig.getUrl().replaceAll("/$", "");
              EmailMessage            message      = new EmailMessage();
              Map<String, Object>     args         = new HashMap<>();

              message.setTo(new String[]{business.getEmail()});
              args.put("link",   url + "#sme.main.dashboard");
              args.put("sendTo", User.EMAIL);
              args.put("business", business.getOrganization());

              try {

                Notification businessCompliancePassedNotification = new Notification.Builder(x)
                  .setBody("Business Passed Compliance")
                  .setNotificationType("BusinessCompliancePassed")
                  .setGroupId(group.toString())
                  .setEmailIsEnabled(true)
                  .setEmailArgs(args)
                  .setEmailName("compliance-notification-to-user")
                  .build();

                business.doNotify(x, businessCompliancePassedNotification);

              } catch (Exception e) {
                logger.error("Error sending compliance-notification-to-user email.", e);
              }
            }
          }
        }, "send business compliance passed email");
        `
      }
    ]
});
