foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'BusinessAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Allows businesses to be acted as.',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'bareUserDAO',
    'groupDAO',
    'localUserDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.session.Session',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.NanoService',
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
        // fetch context and check if not null or user id is 0
        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("Not logged in");
        }

        // get user from session id
        User user = (User) x.get("user");
        if ( user == null ) {
          throw new AuthenticationException("User not found: " + session.getUserId());
        }
        
        // get the most updated user
        User updatedUser = (User) ((DAO) getLocalUserDAO()).find(user.getId());
        updatedUser.setGroup(user.getGroup());

        // check if user group enabled
        Group group = (Group) ((DAO) getGroupDAO()).find(updatedUser.getGroup());
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        // check for two-factor authentication
        if ( updatedUser.getTwoFactorEnabled() && ! session.getContext().getBoolean("twoFactorSuccess") ) {
          throw new AuthenticationException("User requires two-factor authentication");
        }
        
        session.setContext(session.getContext().put("user", updatedUser));
        return updatedUser;
    `
    }
  ]
});
