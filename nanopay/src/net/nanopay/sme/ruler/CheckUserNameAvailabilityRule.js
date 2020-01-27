foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'CheckUserNameAvailabilityRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that check if a user with the same username already
      exists in the system.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `

          User user = (User) obj;
          DAO userDAO = (DAO) x.get("localUserDAO");
          User userWithRequestedUserName = (User) userDAO.find(EQ(User.USER_NAME, user.getUserName()));
          if ( userWithRequestedUserName != null ) {
            throw new RuntimeException("User with same username already exists: " + user.getUserName());
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
            }
          }, "available username");
        `
      }
    ]
});
