foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'AuthIPLoggingService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Service that records request IP adresses when login is attempted',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO',
    'loginAttemptDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'javax.servlet.http.HttpServletRequest',
    'net.nanopay.auth.LoginAttempt',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        if ( getDelegate() instanceof foam.nanos.NanoService ) {
          ((foam.nanos.NanoService) getDelegate()).start();
        }`
    },
    {
      name: 'login',
      javaCode: `

        logLoginIP(x, userId, password);
        return getDelegate().login(x, userId, password);

      `
    },
    {
      name: 'loginByEmail',
      javaCode: `
        logLoginIP(x, email, password);
        return getDelegate().loginByEmail(x, email, password);
        `
    },
    {
      name: 'logLoginIP',
      documentation: 'Logs IP address of attempted login',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'id',
          javaType: 'Object'
        },
        {
          name: 'password',
          javaType: 'String'
        }
      ],
      javaCode: `
        DAO loginAttemptDAO = (DAO) x.get("loginAttemptDAO");
        foam.nanos.auth.User user = ( id instanceof String ) ?
          getUserByEmail(x, (String) id) : getUserById(x, (long) id);
  
        // Create new LoginAttempt and populate IPAddress, and LoginAttemptedFor
        LoginAttempt loginAttempt = new LoginAttempt();
        HttpServletRequest resp     = x.get(HttpServletRequest.class);
        String ipAddress = resp.getRemoteAddr();
        loginAttempt.setIpAddress(ipAddress);
        loginAttempt.setLoginAttemptedFor(user.getId());

        try {
          if (id instanceof String) {
            super.loginByEmail(x, (String) id, password);
          } else {
            super.login(x, (long) id, password);
          }
          loginAttempt.setLoginSuccessful(true);
        } catch ( Throwable t ) {
          loginAttempt.setLoginSuccessful(false);
        } finally {
          loginAttemptDAO.put(loginAttempt);
        }
      `
    },
    {
      name: 'getUserById',
      documentation: 'Convenience method to get a user by id',
      javaReturns: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'id',
          javaType: 'long'
        }
      ],
      javaCode: `
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(id);
      `
    },
    {
      name: 'getUserByEmail',
      documentation: 'Convenience method to get a user by email',
      javaReturns: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'email',
          javaType: 'String'
        }
      ],
      javaCode: `
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(EQ(foam.nanos.auth.User.EMAIL, email));
      `
    }
  ]
});
