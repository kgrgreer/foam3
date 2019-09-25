foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBusinessOnboardingRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Onboards business to AFEX if it is a business and passed comliance.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.model.Business',
    'net.nanopay.fx.afex.AFEXServiceProvider',
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            if ( ! (obj instanceof Business) ) {
              return;
            }
            Business business = (Business) obj;
            AFEXServiceProvider afexServiceProvider = (AFEXServiceProvider) x.get("afexServiceProvider");
            afexServiceProvider.onboardBusiness(business);
          }
        }, "Onboards business to AFEX if it is a business and passed comliance.");
      `
    }
  ]
 });
