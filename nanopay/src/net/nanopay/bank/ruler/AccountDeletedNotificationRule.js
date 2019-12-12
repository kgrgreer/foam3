foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'AccountDeletedNotificationRule',

  documentation: 'Send notification to account owner when bank account has been deleted.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'net.nanopay.contacts.Contact',
    'net.nanopay.bank.BankAccount',
    'foam.core.ContextAgent',
    'foam.nanos.notification.Notification',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userDAO = (DAO) x.get("userDAO");
            BankAccount  account = (BankAccount) super.remove_(x, obj);
            AppConfig    config  = (AppConfig) x.get("appConfig");
            User         owner   = (User) userDAO.find(account.getOwner());

            if ( owner instanceof Contact ){
              return super.remove_(x, obj);
            }

            HashMap<String, Object> args = new HashMap<>();
            args.put("link",    config.getUrl());
            args.put("name",    User.FIRST_NAME);
            args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));

            Notification notification = new Notification();
            owner.doNotify(x, notification);
          }
        }, "Send notification to account owner when account has been deleted.");
      `
    }
  ]
});
