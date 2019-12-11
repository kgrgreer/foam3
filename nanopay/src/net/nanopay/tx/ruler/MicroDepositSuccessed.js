foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositSuccessed',

  documentation: `Send email when micro deposit to bank account succeeds (Funds should be visible in their account).`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
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
            VerificationTransaction txn = (VerificationTransaction) obj;
            DAO accountDAO = (DAO) x.get("accountDAO");
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            User user = (User) acc.findOwner(x);
            
            HashMap<String, Object> args = new HashMap<>();
            args.put("name", User.FIRST_NAME);
            args.put("institution", acc.getInstitutionNumber());
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("accountType", acc.getType());
            args.put("userEmail", user.getEmail());
            args.put("sendTo", user.getEmail());

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
