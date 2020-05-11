foam.CLASS({
  package: 'net.nanopay.account',
  name: 'CreateDefaultDigitalAccountOnUserCreateRule',

  documentation: 'Creates a default digital account when a user is created.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
            Subject subject = new Subject.Builder(x).setUser((User)obj).build();
            service.findDefault(x.put("subject", subject), null);
         }
        },"Finding default account");
      `
    }
  ]
});
