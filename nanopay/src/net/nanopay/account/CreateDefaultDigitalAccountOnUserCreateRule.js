foam.CLASS({
  package: 'net.nanopay.account',
  name: 'CreateDefaultDigitalAccountOnUserCreateRule',

  documentation: 'Creates a default digital account when a user is created.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.account.Account',
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
            DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
            service.findDefault(x.put("user", obj), null);
         }
        },"Finding default account");
      `
    }
  ]
});
