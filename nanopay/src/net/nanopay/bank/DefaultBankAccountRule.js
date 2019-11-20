foam.CLASS({
  package: 'net.nanopay.bank',
  name: 'DefaultBankAccountRule',

  documentation: `
      Set newly verified bank account to default if owner 
      has no default bank accounts in the verified bank accounts denomination.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.bank.BankAccount',
    'foam.core.ContextAgent',
    'foam.core.X'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            BankAccount bankAccount = (BankAccount) obj;

            BankAccount default = (BankAccount) BankAccount.findDefault(x, bankAccount.findOwner(x), bankAccount.getDenomination());
            if ( default == null ) {
              bankAccount.setIsDefault(true);
            } 
         }
        },"Default newly verfied bank account.");
      `
    }
  ]
});
