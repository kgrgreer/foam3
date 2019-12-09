foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositSent',

  documentation: `Send email to user explaining that a bank account has been added and a micro deposit for the added bank account has been sent.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.notification.Notification',
    'foam.util.Emails.EmailsUtility',
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
            HashMap<String, Object> args = new HashMap<>();
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            User user = (User) acc.findOwner(x);
            args.put("name", user.getFirstName());
            args.put("institution", acc.getInstitutionNumber());
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("accountType", acc.getType());
            args.put("userEmail", user.getEmail());
            args.put("sendTo", user.getEmail());

            EmailMessage message = new EmailMessage.Builder(x).setTo((new String[] { user.getEmail() })).build();
            Notification notification = new Notification.Builder(x)
            .setUserId(user.getId())
            .setEmailIsEnabled(true)
            .setEmailName("sent-verifiedBank")
            .setEmailArgs(args)
            .build();
            ((DAO) x.get("localNotificationDAO")).put(notification);
            // user.doNotify(x, notification);

          }
      }, "send notification");
      `
    }
  ]
});
