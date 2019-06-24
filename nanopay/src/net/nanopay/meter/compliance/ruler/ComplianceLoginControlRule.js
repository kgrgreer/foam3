foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceLoginControlRule',

  documentation: `
    Enables or disables the login privileges of users and businesses when they
    pass or fail compliance, respectively.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
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
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            boolean failed = user.getCompliance() == ComplianceStatus.FAILED;
    
            // Only put when it changes.
            if ( user.getLoginEnabled() == failed ) {
              user.setLoginEnabled(!failed);
              DAO localUserDAO = ((DAO) x.get("localUserDAO")).inX(x);
              localUserDAO.put(user);
            }
          }
        });
      `
    }
  ]
});
