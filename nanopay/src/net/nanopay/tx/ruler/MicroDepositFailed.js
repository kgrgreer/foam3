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
    'foam.nanos.notification.email.EmailMessage',
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
            Logger logger = (Logger) x.get("logger");
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
            EmailsUtility.sendEmailFromTemplate(x, user, message, "failed-verifiedBank", args);
            try {
              accountDAO.remove(acc);
            } catch (Exception E) { logger.error("Failed to remove bankaccount. "+E); };
          }
      }, "send notification");
      `
    }
  ]
});
