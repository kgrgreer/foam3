foam.CLASS({
  package: 'net.nanopay.sme.cron',
  name: 'OnboardingReminderCron',

  implements: [
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.cron.Cron',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.auth.User',
    'foam.mlang.sink.Count',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'static foam.mlang.MLang.*'
  ],

  documentation: 'Send onboarding reminder email to businesses created over 24 hours ago without yet completing their onboarding or setting up their bank account',

  properties: [
    {
      class: 'Int',
      name: 'threshold',
      value: 1440,
      documentation: 'Interval threshold in minutes for cronjob.'
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          tpye: 'Context'
        }
      ],
      javaCode:
      `
      Map<String, Object>  args           = null;
      DAO                  businessDAO    = (DAO) x.get("businessDAO");

      // FOR DEFINING THE PERIOD IN WHICH TO CONSIDER SIGN UPS
      Date                 startInterval  = new Date(new Date().getTime() - (1000 * 60 * this.getThreshold()));
      Date                 endInterval    = null;
      Long                 disruptionDiff = 0L;
      Date                 disruption     = ((Cron)((DAO)x.get("cronDAO")).find("Send Onboarding Reminder Email To Businesses Created Over 24 Hours Ago")).getLastRun();

      // Check if there was no service disruption - if so, add/sub diff from endInterval
      disruptionDiff = disruption == null ? 0 : disruption.getTime() - startInterval.getTime();
      endInterval    = new Date(startInterval.getTime() - (1000 * 60 * this.getThreshold()) + disruptionDiff );

      List<Business> businessCreatedOverOneDay = ( (ArraySink) businessDAO.where(
        AND(
          GTE(Business.CREATED, endInterval),
          LT(Business.CREATED, startInterval)
        )
        ).select(new ArraySink())).getArray();

      for( Business business: businessCreatedOverOneDay ) {
        // check if business has a verified bank account set up
        Count accounts = (Count) business.getAccounts(x).where(
            AND(
              INSTANCE_OF(BankAccount.class),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
            )).select(new Count());

        boolean verfiedBankAccount = accounts.getValue() > 0;

        if( ! business.getOnboarded() || ! verfiedBankAccount ){
          // send onboarding reminder email
          args = new HashMap<>();
          try {
            args.put("name", User.FIRST_NAME);
            args.put("business", business.getBusinessName());
            args.put(
              "businessRegistrationLink",
              "https://nanopay.atlassian.net/servicedesk/customer/portal/4/topic/1cbf8d4b-9f54-4a15-9c0a-2e636351b803/article/983084"
            );
            args.put(
              "bankAccountSetupLink",
              "https://nanopay.atlassian.net/servicedesk/customer/portal/4/topic/1cbf8d4b-9f54-4a15-9c0a-2e636351b803/article/950332"
            );

            Notification onboardingReminderNotification = new Notification.Builder(x)
              .setBody("Here's a reminder to complete your business registration on Ablii.")
              .setNotificationType("OnboardingReminder")
              .setEmailIsEnabled(true)
              .setEmailArgs(args)
              .setEmailName("onboarding-reminder")
              .build();

            business.doNotify(x, onboardingReminderNotification);

          } catch (Throwable t) {
            StringBuilder sb = new StringBuilder();
            sb.append("Email meant for business onboarding-reminder Error: Business ");
            sb.append(business.getId());
            ((Logger) x.get("logger")).error(sb.toString(), t);
          }
        }
      }
      `
    }
  ]
});
