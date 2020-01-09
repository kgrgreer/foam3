foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'AccountAddedNotificationRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Sends notifications to account owner detailing that their bank account has been added to the system.`,

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

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userDAO = (DAO) x.get("userDAO");
            BankAccount account = (BankAccount) obj;
            if( account.getRandomDepositAmount() != 0) return;
            User owner = (User) userDAO.find(account.getOwner());
            Group       group      = owner.findGroup(x);
            AppConfig   config     = group != null ? (AppConfig) group.getAppConfig(x) : (AppConfig) x.get("appConfig");
            String accountNumber   = account.getAccountNumber() != null ? account.getAccountNumber().substring(account.getAccountNumber().length() - 4) : "";

            HashMap<String, Object> args = new HashMap<>();
            args.put("name",    User.FIRST_NAME);
            args.put("sendTo",  User.EMAIL);
            args.put("account", accountNumber);
            args.put("link",    config.getUrl());
            args.put("business", owner.getOrganization());

            Notification addedNotification = new Notification.Builder(x)
                    .setBody(accountNumber + " has been added!")
                    .setNotificationType("BankNotifications")
                    .setEmailIsEnabled(true)
                    .setEmailArgs(args)
                    .setEmailName("addBank")
                    .build();
            owner.doNotify(x, addedNotification);
          }
        }, "Sends notifications to account owner detailing that their bank account has been added to the system.");
      `
    }
  ]
 });
