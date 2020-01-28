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
    'logger',
    'groupDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.AccountStatus',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'static foam.mlang.MLang.CLASS_OF',

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
        return login_(x, id, password);
      `
    },
    {
      name: 'login_',
      documentation: 'Helper login function to reduce duplicated code',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaCode: `
        // check login attempts
        User user = getUser(x, id);

        if ( user != null && isLoginAttemptsExceeded(user) ) {
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
          return resetLoginAttempts(x, super.login(x, id, password));
        } catch ( Throwable t ) {
          if ( user == null ) {
            /*
              We check for invalid users in NanopayUserAndGroupAuthService.
              This gets caught here, hence the rethrow.
            */
            throw t;
          }

          // increment login attempts by 1
          user = incrementLoginAttempts(x, user);
          if ( isAdminUser(user) ) incrementNextLoginAttemptAllowedAt(x, user);
          ((Logger) getLogger()).error("Error logging in.", t);
          throw new foam.nanos.auth.AuthenticationException(getErrorMessage(x, user, t.getMessage()));
        }
      `
    },
    {
      name: 'getUserById',
      documentation: 'Convenience method to get a user by id',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ],
      javaCode: `
        return (User) ((DAO) getLocalUserDAO()).inX(x).find(id);
      `
    },
    {
      name: 'getUser',
      documentation: 'Convenience method to get a user by username or email',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'String'
        }
      ],
      javaCode: `
        return (User) ((DAO) getLocalUserDAO())
          .inX(x)
          .find(
            AND(
              OR(
                EQ(User.EMAIL, id.toLowerCase()),
                EQ(User.USER_NAME, id)
              ),
              CLASS_OF(User.class)
            )
          );
      `
    },
    {
      name: 'isLoginAttemptsExceeded',
      documentation: 'Convenience method to check if a user has exceeded their login attempts',
      type: 'Boolean',
      args: [
        {
          name: 'user',
          type: 'User'
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
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        },
        {
          name: 'reason',
          type: 'String'
        }
      ],
      javaCode: `
        if ( AccountStatus.DISABLED == user.getStatus() ) {
          return reason;
        }
        int remaining = getMaxAttempts() - user.getLoginAttempts();
        if ( remaining > 0 ) {
          return "Login failed (" + reason + "). " + ( remaining ) + " attempts remaining.";
        } else {
          if ( isAdminUser(user) ){
            User tempUser = getUserById(x, user.getId());
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
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode: `
        if ( user.getLoginAttempts() == 0 ) {
          return user;
        }

        user = user.isFrozen() ? (User) user.fclone() : user;
        user.setLoginAttempts((short) 0);
        user.setNextLoginAttemptAllowedAt(new Date());
        return (User) ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    },
    {
      name: 'incrementLoginAttempts',
      documentation: 'Increments login attempts by 1',
      type: 'User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'User'
        }
      ],
      javaCode: `
        user = user.isFrozen() ? (User) user.fclone() : user;
        user.setLoginAttempts((short) (user.getLoginAttempts() + 1));
        return (User) ((foam.dao.DAO) getLocalUserDAO()).put(user);
      `
    },
    {
       name: 'incrementNextLoginAttemptAllowedAt',
       documentation: 'Increases time delay between attempts',
       type: 'Void',
       args: [
         {
           name: 'x',
           type: 'Context'
         },
         {
           name: 'user',
           type: 'User'
         }
       ],
       javaCode: `
         user = user.isFrozen() ? (User) user.fclone() : user;
         Calendar cal = Calendar.getInstance();
         cal.add((Calendar.MINUTE), user.getLoginAttempts() * getLoginDelayMultiplier());
         user.setNextLoginAttemptAllowedAt(cal.getTime());
         ((foam.dao.DAO) getLocalUserDAO()).put(user);
       `
     },
    {
      name: 'isAdminUser',
      documentation: 'Convenience method to check if a user is an admin user',
      type: 'Boolean',
      args: [
        {
          name: 'user',
          type: 'User'
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
      type: 'Boolean',
      args: [
        {
          name: 'user',
          type: 'User'
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
