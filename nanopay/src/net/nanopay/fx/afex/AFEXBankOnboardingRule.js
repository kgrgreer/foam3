foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankOnboardingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Onboards bank account owner to AFEX if it is a business and passed comliance.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.afex.AFEXServiceProvider',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof BankAccount) ) {
              return;
            }
            BankAccount bankAccount = (BankAccount) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            afexServiceProvider.onboardBusiness(bankAccount);
          }
        }, "Onboards bank account owner to AFEX if it is a business and passed comliance.");
      `
    }
  ]
 });
