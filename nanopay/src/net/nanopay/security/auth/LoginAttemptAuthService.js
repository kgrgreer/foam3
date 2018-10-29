foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'LoginAttemptAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Decorator that prevents a user from exceeding their maximum allotted login attempts',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'Short',
      name: 'maxAttempts',
      value: 5
    }
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
        return login_(x, userId, password);
      `
    },
    {
      name: 'loginByEmail',
      javaCode: `
        return login_(x, email, password);
      `
    },
    {
      name: 'login_',
      documentation: 'Helper login function to reduce duplicated code',
      javaReturns: 'foam.nanos.auth.User',
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
        // check login attempts
        foam.nanos.auth.User user = ( id instanceof String ) ?
          getUserByEmail(x, (String) id) : getUserById(x, (long) id);
        if ( isLoginAttemptsExceeded(user) ) {
          throw new foam.nanos.auth.AuthenticationException("Login attempts exceeded");
        }

        try {
          // attempt to login in, on success reset the login attempts
          return resetLoginAttempts(x, ( id instanceof String ) ?
            super.loginByEmail(x, (String) id, password) :
            super.login(x, (long) id, password));
        } catch ( Throwable t ) {
          // increment login attempts by 1
          incrementLoginAttempts(x, user);
          throw new foam.nanos.auth.AuthenticationException(getErrorMessage(user));
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
    },
    {
      name: 'isLoginAttemptsExceeded',
      documentation: 'Convenience method to check if a user has exceeded their login attempts',
      javaReturns: 'boolean',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        }
        return user.getLoginAttempts() >= getMaxAttempts();
      `
    },
    {
      name: 'getErrorMessage',
      documentation: 'Convenience method with returns a formatted error message',
      javaReturns: 'String',
      args: [
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        int remaining = getMaxAttempts() - user.getLoginAttempts();
        return ( remaining == 0 ) ? "Login attempts exceeded." :
          "Login failed. " + ( remaining ) + " attempts remaining.";
      `
    },
    {
      name: 'resetLoginAttempts',
      documentation: 'Checks if login attempts have been modified, and resets them if they have been',
      javaReturns: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        if ( user.getLoginAttempts() == 0 ) {
          return user;
        }

        user = user.isFrozen() ? (foam.nanos.auth.User) user.fclone() : user;
        user.setLoginAttempts((short) 0);
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    },
    {
      name: 'incrementLoginAttempts',
      documentation: 'Increments login attempts by 1',
      javaReturns: 'void',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `
        user = user.isFrozen() ? (foam.nanos.auth.User) user.fclone() : user;
        user.setLoginAttempts((short) (user.getLoginAttempts() + 1));
        ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    }
  ]
});
