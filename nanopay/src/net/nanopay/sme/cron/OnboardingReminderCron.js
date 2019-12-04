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
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Emails.EmailsUtility',
    'java.util.Date',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'net.nanopay.model.Business',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'static foam.mlang.MLang.*',
  ],
  documentation: 'Send onboarding reminder email to businesses created over 24 hours ago without yet completing their onboarding or setting up their bank account',

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
      DAO                  businessDAO    = (DAO) x.get("businessDAO");

      // FOR DEFINING THE PERIOD IN WHICH TO CONSIDER SIGN UPS
      Date                 startInterval  = new Date(new Date().getTime() - (1000 * 60 * 60 * 24));
      Date                 endInterval    = null;
      Long                 disruptionDiff = 0L;
      Date                 disruption     = ((Cron)((DAO)x.get("cronDAO")).find("Send Welcome Email to Ablii Business 30min after SignUp")).getLastRun();

      // Check if there was no service disruption - if so, add/sub diff from endInterval
      disruptionDiff = disruption == null ? 0 : disruption.getTime() - startInterval.getTime();
      endInterval    = new Date(startInterval.getTime() - (1000 * 60 * 60 * 24) + disruptionDiff );

      List<Business> businessCreatedOverOneDay = ( (ArraySink) businessDAO.where(
        AND(
          GTE(Business.CREATED, endInterval),
          LT(Business.CREATED, startInterval))
        ).select(new ArraySink())).getArray();

      for(Business business: businessCreatedOverOneDay) {

        //check if business has a verfied bank account set up
        boolean verfiedBankAccount = false;
        List<BankAccount> accounts = ( (ArraySink) business.getAccounts(x).where(
          INSTANCE_OF(BankAccount.class)
        ).select(new ArraySink())).getArray();

        for(BankAccount account: accounts){
          if(BankAccountStatus.VERIFIED.equals(account.getStatus())){
            verfiedBankAccount = true;
            break;
          }
        }

        if(!business.getOnboarded() || !verfiedBankAccount){
          //send email
        }
      }
      `
    }
  ]
});
