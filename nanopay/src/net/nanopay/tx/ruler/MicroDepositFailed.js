foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositFailed',

  documentation: `Send email when micro deposit from bank account verification fails`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
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
            Logger logger = (Logger) x.get("logger");
            BankAccount acc = (BankAccount) accountDAO.find(EQ(Account.ID, txn.getDestinationAccount()));
            User user = (User) acc.findOwner(x);
            
            String subject = "Your bank account verification has failed";
            String title = "Bank account verification failed";
            String infor = "Your bank account verification was unsuccessful:";
            String content1 = "We were unable to send a micro-deposit to your bank account. Please confirm your account information is correct and try adding a bank account again. Your bank account details will remain confidential, as privacy is our top priority.";
            
            HashMap<String, Object> args = new HashMap<>();
            args.put("subject", subject);
            args.put("title", title);
            args.put("infor", infor);
            args.put("content1", content1);
            args.put("name", user.getFirstName());
            args.put("institution",acc.getInstitutionNumber());
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("accountType", acc.getType());
            args.put("userEmail", user.getEmail());
            args.put("sendTo", user.getEmail());

            Notification notification = new Notification.Builder(x)
            .setEmailName("micro-deposit-bank-verify")
            .setEmailArgs(args)
            .build();
            user.doNotify(x, notification);
            try {
              accountDAO.remove(acc);
            } catch (Exception E) { logger.error("Failed to remove bankaccount. "+E); };
          }
      }, "send notification");
      `
    }
  ]
});
