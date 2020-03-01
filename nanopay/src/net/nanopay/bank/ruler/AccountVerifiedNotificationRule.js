foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'AccountVerifiedNotificationRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Sends notifications to account owner detailing that their bank account has been verified.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'java.util.HashMap',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO userDAO = (DAO) x.get("userDAO");
        BankAccount account = (BankAccount) obj;
        User owner = (User) userDAO.find(account.getOwner());
        if ( owner instanceof Contact && account.getCreatedBy() != owner.getId() ) return;
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Group       group      = owner.findGroup(x);
            AppConfig   config     = group != null ? (AppConfig) group.getAppConfig(x) : null;
            Branch currBranch = (Branch) account.findBranch(x);
            String institutionName = "";
            if ( config == null ) return;

            if ( currBranch != null ) {
              Institution currInstitution = (Institution) currBranch.findInstitution(x);
              institutionName = currInstitution == null ? null : currInstitution.toSummary();
            }
            HashMap<String, Object> args    = new HashMap<>();
            args.put("link",    config.getUrl());
            args.put("name",    User.FIRST_NAME);
            args.put("accountNumber",  "***" + account.getAccountNumber().substring(account.getAccountNumber().length() - 4));
            args.put("institution", institutionName);
            args.put("institutionNumber", account.getInstitutionNumber());
            args.put("accountType", account.getType());
            args.put("userEmail", User.EMAIL);
            args.put("sendTo", User.EMAIL);

            Notification verifiedNotification = new Notification.Builder(x)
                    .setBody(account.getName() + " has been verified!")
                    .setNotificationType("Latest_Activity")
                    .setEmailIsEnabled(true)
                    .setEmailArgs(args)
                    .setEmailName("verifiedBank")
                    .build();
            owner.doNotify(x, verifiedNotification);
          }
        }, "Sends notifications to account owner detailing that their bank account has been verified.");
      `
    }
  ]
 });
