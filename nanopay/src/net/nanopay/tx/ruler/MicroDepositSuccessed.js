foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositSuccessed',

  documentation: `Send email when micro deposit to bank account succeeds (Funds should be visible in their account).`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.tx.cico.VerificationTransaction',
    'java.util.HashMap',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
          @Override
           public void execute(X x) {
            String institutionName;
            VerificationTransaction txn = (VerificationTransaction) obj;
            DAO accountDAO = (DAO) x.get("accountDAO");
            DAO institutionDAO = (DAO) x.get("institutionDAO");
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            Institution institution = (Institution) institutionDAO.find(EQ(Institution.INSTITUTION_NUMBER,acc.getInstitutionNumber()));
            User user = (User) acc.findOwner(x);
            AppConfig config = user.findGroup(x).getAppConfig(x);

            institutionName = institution == null ? null : institution.label();

            HashMap<String, Object> args = new HashMap<>();
            args.put("name", User.FIRST_NAME);
            args.put("institutionNumber", acc.getInstitutionNumber());
            args.put("institutionName", institutionName);
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("userEmail", User.EMAIL);
            args.put("sendTo", User.EMAIL);
            args.put("link", config.getUrl());

            Notification notification = new Notification.Builder(x)
            .setBody(acc.getAccountNumber() + "micro deposit has been verified")
            .setNotificationType("bankNotifications")
            .setEmailName("micro-deposit-successed")
            .setEmailArgs(args)
            .build();
            user.doNotify(x, notification);
          }
      }, "send notification");
      `
    }
  ]
});
