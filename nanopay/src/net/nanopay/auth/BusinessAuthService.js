foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Allows businesses to be acted as.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.NanoService',
    'net.nanopay.admin.model.AccountStatus'
  ],

  methods: [
    {
      name: 'start',
      javaCode:
        `if ( getDelegate() instanceof NanoService ) {
          ((NanoService) getDelegate()).start();
        }`
    },
    {
      name: 'getCurrentUser',
      javaCode: `
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check user status is not disabled
        if ( AccountStatus.DISABLED == user.getStatus() ) {
          throw new AuthenticationException("User disabled");
        }
        return getDelegate().getCurrentUser(x);
    `
    }
  ]
});
