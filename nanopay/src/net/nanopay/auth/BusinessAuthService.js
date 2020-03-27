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
    'foam.nanos.auth.Group',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.session.Session',
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
        // TODO: PRE 3.7.2 Remove all logic except for account status check change return to call delegate getCurrentUser.
        Session session = x.get(Session.class);

        // fetch context and check if not null or user id is 0
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("Not logged in");
        }

        // get user from session id
        User user = (User) ((DAO) getLocalUserDAO()).find(session.getUserId());
        if ( user == null ) {
          throw new AuthenticationException("User not found: " + session.getUserId());
        }

        // check if user enabled
        if ( ! user.getEnabled() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if group enabled
        Group group = (Group) x.get("group");
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        // check for two-factor authentication
        if ( user.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
          throw new AuthenticationException("User requires two-factor authentication");
        }

        // check user status is not disabled
        if ( AccountStatus.DISABLED == user.getStatus() ) {
          throw new AuthenticationException("User disabled");
        }

        return user;
    `
    }
  ]
});
