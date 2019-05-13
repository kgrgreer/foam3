foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'CheckCurrencyRule',
  flags: ['java'],

  documentation: 'Checks if user has permission to work with a currency.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.PropertyInfo',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'net.nanopay.account.Account'
  ],

  messages: [
    {
      name: 'LACKS_PERMISSION',
      message: 'You do not have permission to work with this currency: '
    },
    {
      name: 'DESCRIBE_TEXT',
      message: 'Checks if the user has permission to work with a currency.'
    }
  ],

  properties: [
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'property',
      documentation: `
        The property that should be checked. The property's value should be the
        alphabeticCode of a Currency object.
      `
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! hasPermission(x, obj) ) {
          String currency = (String) getProperty().get(obj);
          throw new AuthorizationException(LACKS_PERMISSION + currency);
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '// No-op'
    },
    {
      name: 'canExecute',
      javaCode: `return hasPermission(x, obj);`
    },
    {
      name: 'describe',
      javaCode: `return DESCRIBE_TEXT;`
    },
    {
      name: 'hasPermission',
      type: 'Boolean',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        String currency = (String) getProperty().get(obj);
        return auth.check(x, "currency.read." + currency);
      `
    }
  ]
});
