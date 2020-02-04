foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'AccountDeletedNotificationRule',

  documentation: 'Send notification to account owner when bank account has been deleted.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'java.util.HashMap',
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! ( obj instanceof BankAccount ) ) return;
            DAO          userDAO = (DAO) x.get("userDAO");
            BankAccount  account = (BankAccount) obj;
            User           owner = (User) userDAO.find(account.getOwner());
            Group          group = owner.findGroup(x);
            AppConfig     config = group != null ? (AppConfig) group.getAppConfig(x) : null;

            if ( config == null ) return;
            if ( owner instanceof Contact ) return;

            HashMap<String, Object> args = new HashMap<>();
            args.put("link",    config.getUrl());
            args.put("name",    User.FIRST_NAME);
            args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));

            Notification deletedNotification = new Notification.Builder(x)
                    .setBody(account.getName() + " has been deleted.")
                    .setNotificationType("BankNotifications")
                    .setEmailIsEnabled(true)
                    .setEmailArgs(args)
                    .setEmailName("deletedBank")
                    .build();

            owner.doNotify(x, deletedNotification);
          }
        }, "Send notification to account owner when account has been deleted.");
      `
    }
  ]
});
