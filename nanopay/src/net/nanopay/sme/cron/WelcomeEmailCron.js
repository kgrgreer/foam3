foam.CLASS({
  package: 'net.nanopay.sme.cron',
  name: 'WelcomeEmailCron',
  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.cron.Cron',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.Notification',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  documentation: 'Send Welcome Email to Ablii Business 30min after SignUp',

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode:
        `
        EmailMessage         message        = null;
        Map<String, Object>  args           = null;
        DAO                  businessDAO    = (DAO) x.get("businessDAO");

        // FOR DEFINING THE PERIOD IN WHICH TO CONSIDER SIGN UPS
        Date                 startInterval  = new Date(new Date().getTime() - (1000 * 60 * 30));
        Date                 endInterval    = null;
        Long                 disruptionDiff = 0L;
        Date                 disruption     = ((Cron)((DAO)x.get("cronDAO")).find("Send Welcome Email to Ablii Business 30min after SignUp")).getLastRun();

        // Check if there was no service disruption - if so, add/sub diff from endInterval
        disruptionDiff = disruption == null ? 0 : disruption.getTime() - startInterval.getTime();
        endInterval    = new Date(startInterval.getTime() - (1000 * 60 * 30) + disruptionDiff );

        List<Business> businessOnboardedInLastXmin = ( (ArraySink) businessDAO.where(
          AND(
            GTE(Business.CREATED, endInterval),
            LT(Business.CREATED, startInterval))
          ).select(new ArraySink())).getArray();

        for(Business business : businessOnboardedInLastXmin) {
          message        = new EmailMessage();
          args           = new HashMap<>();

          message.setTo(new String[]{ business.getEmail() });
          args.put("name", User.FIRST_NAME);
          try {
            Notification helpSignUpNotification = new Notification.Builder(x)
              .setBody("Send Welcome Email After 30 Minutes.")
              .setNotificationType("WelcomeEmail")
              .setEmailIsEnabled(true)
              .setEmailArgs(args)
              .setEmailName("helpsignup")
              .build();

            business.doNotify(x, helpSignUpNotification);

          } catch (Throwable t) {
            StringBuilder sb = new StringBuilder();
            sb.append("Email meant for business SignUp Error: Business ");
            sb.append(business.getId());
            ((Logger) x.get("logger")).error(sb.toString(), t);
          }
        }
        `
    }
  ]
});
