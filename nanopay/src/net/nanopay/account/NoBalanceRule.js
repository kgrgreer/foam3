foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoBalanceRule',

  documentation: `Validator that checks if account has a zero balance or not.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.account.DigitalAccount'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      if ( obj instanceof DigitalAccount ) {
        DigitalAccount digitalAccount = (DigitalAccount) obj;
        long balance = (long) digitalAccount.findBalance(x);
        if ( balance != 0 ) {
          Logger logger = (Logger) x.get("logger");
          logger.log("Cannot delete account " + digitalAccount.getId() + " as it has a balance of " + balance);
          throw new  RuntimeException("Cannot delete this account as its balance is not 0");
        }
      }
      `
    }
  ]
});
