foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBankOnboardingRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Onboards bank account owner to AFEX if it is a business and passed comliance.`,

   javaImports: [
    'foam.core.ContextAwareAgent',
    'foam.core.X',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.fx.afex.AFEXServiceProvider',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAwareAgent() {
          @Override
          public void execute(X x) {
            BankAccount bankAccount = (BankAccount) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) getX().get("afexServiceProvider");
            afexServiceProvider.onboardBusiness(bankAccount);
          }
        }, "Onboards bank account owner to AFEX if it is a business and passed comliance.");
      `
    }
  ]
 });
