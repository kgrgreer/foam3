foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'VerifyBankRule',

  documentation: 'Rule creates a verification transaction when a new canadian bank account is added',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.account.DigitalAccount',
    'foam.nanos.auth.User',
    'foam.core.X',
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

          BankAccount account = (BankAccount) obj;

          long randomDepositAmount = (long) (1 + Math.floor(Math.random() * 99));
          account.setRandomDepositAmount(randomDepositAmount);

          User user = (User) x.get("user");

          VerificationTransaction transaction = new VerificationTransaction();

          transaction.setDestinationAccount(account.getId());
          transaction.setAmount(randomDepositAmount);
          transaction.setSourceCurrency(account.getDenomination());
          transaction.setSourceAccount(DigitalAccount.findDefault(getX(), user, transaction.getSourceCurrency()).getId());

          DAO txDao = (DAO) (getX().get("localTransactionDAO"));
          txDao.put_(x, transaction);

         }
        }, "Creates a microdeposit verification transaction");
      `
    }
  ]
});
