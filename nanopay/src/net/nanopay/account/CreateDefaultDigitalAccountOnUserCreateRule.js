foam.CLASS({
  package: 'net.nanopay.account',
  name: 'CreateDefaultDigitalAccountOnUserCreateRule',

  documentation: 'Creates a default digital account when a user is created.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.account.Account'
  ],

  messages: [
    {
      name: 'DESCRIBE_TEXT',
      message: 'Creates a default digital account when a user is created.'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DigitalAccountService service = (DigitalAccountService) x.get("digitalAccount");
        service.findDefault(x, null);
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '// No-op'
    },
    {
      name: 'canExecute',
      javaCode: 'return true;'
    },
    {
      name: 'describe',
      javaCode: 'return DESCRIBE_TEXT;'
    }
  ]
});
