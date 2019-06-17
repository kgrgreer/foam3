foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceLoginControlRule',

  documentation: `
    Enables or disables the login privileges of users and businesses when they
    pass or fail compliance, respectively.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  messages: [
    {
      name: 'DESCRIBE_TEXT',
      message: 'Enables or disables the login privileges of users and businesses when they pass or fail compliance, respectively.'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj;
        boolean failed = user.getCompliance() == ComplianceStatus.FAILED;

        // Only put when it changes.
        if ( user.getLoginEnabled() == failed ) {
          user.setLoginEnabled(!failed);
          DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
          localUserDAO.put(user);
        }
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
      javaCode: `return DESCRIBE_TEXT;`
    }
  ]
});
