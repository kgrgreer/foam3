foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'IPLoggingAuthService',
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
    'foam.nanos.auth.User',
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
        boolean successful = false;
        User user = (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(userId);     
        try {
          super.login(x, (long) userId, password);
          successful = true;
          return user;
        } catch (Throwable t) {
          throw t;          
        } finally {
          recordLoginAttempt(x, userId, successful);
        }
      `
    },
    {
      name: 'loginByEmail',
      javaCode: `
        boolean successful = false;
        User user = (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(EQ(foam.nanos.auth.User.EMAIL, email));
        try {
          super.loginByEmail(x, (String) email, password);
          successful = true;
          return user;          
        } catch (Throwable t) {
          throw t;          
        } finally {
          recordLoginAttempt(x, user.getId(), successful);
        }
      `
    },
    {
      name: 'recordLoginAttempt',
      documentation: 'Logs IP address of attempted login',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'id',
          javaType: 'Long'
        },
        {
          name: 'successful',
          javaType: 'boolean'
        }
      ],
      javaCode: `
        DAO loginAttemptDAO = (DAO) x.get("loginAttemptDAO");
        // foam.nanos.auth.User user = ( id instanceof String ) ?
        //   getUserByEmail(x, (String) id) : getUserById(x, (long) id);
  
        // Create new LoginAttempt and put to DAO
        LoginAttempt loginAttempt = new LoginAttempt();
        HttpServletRequest request = x.get(HttpServletRequest.class);
        String ipAddress = request.getRemoteAddr();
        loginAttempt.setIpAddress(ipAddress);
        loginAttempt.setLoginAttemptedFor(id);
        loginAttempt.setLoginSuccessful(successful);
        loginAttemptDAO.put(loginAttempt);
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
