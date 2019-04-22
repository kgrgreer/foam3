foam.CLASS({
  package: 'net.nanopay.account',
  name: 'NoBalanceRule',

  documentation: `Validator that checks if account has a zero balance or not.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.account.DigitalAccount'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      if ( obj instanceof DigitalAccount ) {
        if ( (long) ( (DigitalAccount) obj ).findBalance(x) > 0 ) {
          throw new  RuntimeException("Cannot delete this account as it's balance is not 0");
        }
      }
      `
    }
  ]
});
