foam.CLASS({
  package: 'net.nanopay.business.ruler',
  name: 'RegistrationLoginDisabledRule',

  documentation: 'Set loginEnabled to false for new user creation on gd spid',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            // This will set loginEnabled to false for both user and business
            User user = (User) obj;
            user.setLoginEnabled(false);
          }
        }, "User login enabled is false");
      `,
    }
  ]
});
