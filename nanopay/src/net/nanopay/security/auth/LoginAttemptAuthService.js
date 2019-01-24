foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'LoginAttemptAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Decorator that prevents a user from exceeding their maximum allotted login attempts',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'localUserDAO',
    'logger'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.EQ',

    'java.util.Date',
    'java.util.Calendar',
    'java.text.SimpleDateFormat'
  ],

  properties: [
    {
      class: 'Short',
      name: 'maxAttempts',
      value: 5
    },
    {
      class: 'FObjectProperty',
      name: 'dateFormat',
      javaType: 'java.text.SimpleDateFormat',
      javaFactory: 'SimpleDateFormat df =  new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); df.setTimeZone(java.util.TimeZone.getTimeZone("UTC")); return df;',
    },
    {
      class: 'Short',
      name: 'loginDelayMultiplier',
      value: 5
    },
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

        if ( ! user.getLoginEnabled() || ! user.getEnabled() ) {
          throw new foam.nanos.auth.AuthenticationException("Account locked. Please contact customer service.");
        }

        if ( isLoginAttemptsExceeded(user) ) {
          if ( isAdminUser(user) ) {
            if ( ! loginFreezeWindowReached(user) ) {
              throw new foam.nanos.auth.AuthenticationException("Account temporarily locked. You can attempt to login after " + getDateFormat().format(user.getNextLoginAttemptAllowedAt()));
            }
          }  else {
            throw new foam.nanos.auth.AuthenticationException("Account locked. Please contact customer service.");
          }
        }

        try {
          // attempt to login in, on success reset the login attempts
          return resetLoginAttempts(x, ( id instanceof String ) ?
            super.loginByEmail(x, (String) id, password) :
            super.login(x, (long) id, password));
        } catch ( Throwable t ) {
          // increment login attempts by 1
          user = incrementLoginAttempts(x, user);
          if ( isAdminUser(user) ) incrementNextLoginAttemptAllowedAt(x, user);
          ((Logger) getLogger()).error("Error logging in.", t);
          throw new foam.nanos.auth.AuthenticationException(getErrorMessage(x, user));
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
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(EQ(foam.nanos.auth.User.EMAIL, email.toLowerCase()));
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
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'user',
          javaType: 'foam.nanos.auth.User'
        }
      ],
      javaCode: `

        int remaining = getMaxAttempts() - user.getLoginAttempts();
        if ( remaining > 0 ) {
          return "Login failed. " + ( remaining ) + " attempts remaining.";
        } else {
          if ( isAdminUser(user) ){
            foam.nanos.auth.User tempUser = getUserById(x, user.getId());
            return "Account temporarily locked. You can attempt to login after " + getDateFormat().format(tempUser.getNextLoginAttemptAllowedAt());
          } else {
            return "Account locked. Please contact customer service." ;
          }
        }
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
        user.setNextLoginAttemptAllowedAt(new Date());
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    },
    {
      name: 'incrementLoginAttempts',
      documentation: 'Increments login attempts by 1',
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
        user = user.isFrozen() ? (foam.nanos.auth.User) user.fclone() : user;
        user.setLoginAttempts((short) (user.getLoginAttempts() + 1));
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    },
    {
       name: 'incrementNextLoginAttemptAllowedAt',
       documentation: 'Increases time delay between attempts',
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
         Calendar cal = Calendar.getInstance();
         cal.add((Calendar.MINUTE), user.getLoginAttempts() * getLoginDelayMultiplier());
         user.setNextLoginAttemptAllowedAt(cal.getTime());
         ((foam.dao.DAO) getLocalUserDAO()).put(user);
       `
     },
    {
      name: 'isAdminUser',
      documentation: 'Convenience method to check if a user is an admin user',
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
        return "admin".equalsIgnoreCase(user.getGroup());
      `
    },
    {
      name: 'loginFreezeWindowReached',
      documentation: 'Convenience method to check if user next allowed login attempt date has been reached',
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
        Calendar now = Calendar.getInstance();
        Calendar cal = Calendar.getInstance();
        cal.setTime(user.getNextLoginAttemptAllowedAt());
        return now.compareTo(cal) > 0;
      `
    },
  ]
});
