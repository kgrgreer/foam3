foam.CLASS({
  package: 'net.nanopay.account',
  name: 'CreateDefaultDigitalAccountOnUserCreateRule',

  documentation: 'Creates a default digital account when a user is created.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.account.Account'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
        service.findDefault(x, null);
      `
    }
  ]
});
