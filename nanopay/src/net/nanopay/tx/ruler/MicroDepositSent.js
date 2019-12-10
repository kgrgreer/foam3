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
            
            String subject = "Your bank account has been added";
            String title = "Bank account added";
            String infor = "Your bank account has been added to your business:";
            String content1 = "We\’ve made a very small deposit into your bank account. The micro-deposit will take 1-3 business days to show up on your statement. The statement description for this deposit will be NANOPAY X-BORDER.";
            String content2 = "We will notify you when the micro-deposit arrives in your account. Your bank account will remain unverified until you enter the micro-deposit amount.";
            
            HashMap<String, Object> args = new HashMap<>();
            args.put("subject", subject);
            args.put("title", title);
            args.put("infor", infor);
            args.put("content1", content1);
            args.put("content2", content2);
            args.put("name", user.getFirstName());
            args.put("institution", acc.getInstitutionNumber());
            args.put("accountNumber", acc.getAccountNumber().substring(4));
            args.put("accountType", acc.getType());
            args.put("userEmail", user.getEmail());
            args.put("sendTo", user.getEmail());

            Notification notification = new Notification.Builder(x)
            .setEmailName("micro-deposit-bank-verify")
            .setEmailArgs(args)
            .build();
            user.doNotify(x, notification);

          }
      }, "send notification");
      `
    }
  ]
});
