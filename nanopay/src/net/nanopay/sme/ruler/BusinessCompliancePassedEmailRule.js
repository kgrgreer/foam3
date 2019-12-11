foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'BusinessCompliancePassedEmailRule',

    documentation: `Sends email to signing officer after their business passes compliance.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.auth.Address',
      'foam.nanos.auth.Group',
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
              Group                   group        = (Group) x.get("group");
              EmailMessage            message      = new EmailMessage();
              Map<String, Object>     args         = new HashMap<>();
              String                  url          = "http://ablii:8080/#sme.main.dashboard";

              message.setTo(new String[]{business.getEmail()});
              args.put("link", url);
              args.put("sendTo", business.getEmail());
              args.put("business", business.getOrganization());

              try {

                Notification businessCompliancePassedNotification = new Notification.Builder(x)
                  .setBody("Business Passed Compliance")
                  .setNotificationType("BusinessCompliancePassed")
                  .setGroupId(group.toString())
                  .setEmailIsEnabled(true)
                  .setEmailArgs(args)
                  .setUserId(business.getId())
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
