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
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User'
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
      EmailMessage         message        = null;
      Map<String, Object>  args           = null;
      DAO                  businessDAO    = (DAO) x.get("businessDAO");
      DAO                  agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
      DAO                  userDAO        = (DAO) x.get("userDAO");

      // FOR DEFINING THE PERIOD IN WHICH TO CONSIDER SIGN UPS
      Date                 startInterval  = new Date(new Date().getTime() - (1000 * 60 * 60 * 24));
      Date                 endInterval    = null;
      Date                 testStartInt   = new Date(new Date().getTime());
      Date                 testEndInt     = new Date(new Date().getTime() - (1000 * 60 * 60 * 24));
      Long                 disruptionDiff = 0L;
      Date                 disruption     = ((Cron)((DAO)x.get("cronDAO")).find("Send Welcome Email to Ablii Business 30min after SignUp")).getLastRun();

      // Check if there was no service disruption - if so, add/sub diff from endInterval
      disruptionDiff = disruption == null ? 0 : disruption.getTime() - startInterval.getTime();
      endInterval    = new Date(startInterval.getTime() - (1000 * 60 * 60 * 24) + disruptionDiff );

      List<Business> businessCreatedOverOneDay = ( (ArraySink) businessDAO.where(
        AND(
          GTE(Business.CREATED, testEndInt),
          LT(Business.CREATED, testStartInt))
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
        boolean sendEmail = false;
        if(!business.getOnboarded() || !verfiedBankAccount){
          //send email
          message        = new EmailMessage();
          args           = new HashMap<>();

          try {
            //find first name of email recepient
            String recepientFirstName = null;
            if(business.getOnboarded()){
              recepientFirstName = business.findSigningOfficer(x).getFirstName();
            }
            //no registered signing officers
            else{
              // List<BusinessUserJunction> businessAgents = ((ArraySink) agentJunctionDAO.where(
              //     EQ(BusinessUserJunction.TARGET_ID, business.getId())
              // ).select(new ArraySink())).getArray();
              // if ( businessAgents == null || businessAgents.size() == 0 ) {
              //   throw new RuntimeException("Agents not found");
              // }
              //
              // for(BusinessUserJunction businessUserJunction: businessAgents){
              //   User user = (User) userDAO.find(businessUserJunction.getSourceId());
              //   if(user.getEmail().equals(business.getEmail())){
              //     recepientFirstName = user.getFirstName();
              //     break;
              //   }
              // }
              List users = ((ArraySink) userDAO.where(
                EQ(User.EMAIL, business.getEmail())
              ).select(new ArraySink())).getArray();
              User user = (User) users.get(0);
              recepientFirstName = user.getFirstName();
            }

            message.setTo(new String[]{ business.getEmail() });
            args.put("name", recepientFirstName);
            args.put("sendTo", business.getEmail());
            args.put(
              "businessRegistrationLink",
              "https://nanopay.atlassian.net/servicedesk/customer/portal/4/topic/1cbf8d4b-9f54-4a15-9c0a-2e636351b803/article/983084"
            );
            args.put(
              "bankAccountSetupLink",
              "https://nanopay.atlassian.net/servicedesk/customer/portal/4/topic/1cbf8d4b-9f54-4a15-9c0a-2e636351b803/article/950332"
            );
            EmailsUtility.sendEmailFromTemplate(x, business, message, "onboarding-reminder", args);
          } catch (Throwable t) {
            StringBuilder sb = new StringBuilder();
            sb.append("Email meant for business onboarding-reminder Error: Business ");
            sb.append(business.getId());
            ((Logger) x.get("logger")).error(sb.toString(), t);
          }

          sendEmail = true;
        }
        boolean bp = sendEmail;
      }
      `
    }
  ]
});
