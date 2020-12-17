/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security.auth',
  name: 'LoginAttemptAuthService',
  extends: 'foam.nanos.auth.ProxyAuthService',

  documentation: 'Decorator that prevents a user from exceeding their maximum allotted login attempts',

  implements: [
    'foam.nanos.NanoService'
  ],

  imports: [
    'DAO localUserDAO',
    'DAO groupDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'static foam.mlang.MLang.CLASS_OF',
    'net.nanopay.admin.model.AccountStatus',
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
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
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
        return login_(x, identifier, password);
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
          name: 'identifier',
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaCode: `
        if ( SafetyUtil.isEmpty(identifier) &&
             SafetyUtil.isEmpty(password) ) {
          throw new AuthenticationException("Not logged in");
        }

        // check login attempts
        LoginAttempts la = null;
        User user = getUser(x, identifier);
        if ( user != null ) {
          la = (LoginAttempts) ((DAO) x.get("localLoginAttemptsDAO")).find_(x, user.getId());
          if ( la == null ) {
            la = new LoginAttempts();
            la.setId(user.getId());
          } else {
            la = (LoginAttempts) la.fclone();
          }
        }

        if ( user != null &&
             isLoginAttemptsExceeded(la) ) {
          if ( isAdminUser(user) ) {
            if ( ! loginFreezeWindowReached(la) ) {
              throw new foam.nanos.auth.AuthenticationException("Account temporarily locked. You can attempt to login after " + getDateFormat().format(la.getNextLoginAttemptAllowedAt()));
            }
          }  else {
            throw new foam.nanos.auth.AuthenticationException("Account locked. Please contact customer service.");
          }
        }

        try {
          // attempt to login in, on success reset the login attempts
          User u = super.login(x, identifier, password);
          resetLoginAttempts(x, la);
          return u;
        } catch ( Throwable t ) {
          if ( user == null ) {
            /*
              We check for invalid users in NanopayUserAndGroupAuthService.
              This gets caught here, hence the rethrow.
            */
            throw t;
          }

          // increment login attempts by 1
          la = incrementLoginAttempts(x, la);
          if ( isAdminUser(user) ) incrementNextLoginAttemptAllowedAt(x, la);
          getLogger().error("Error logging in.", t);
          throw new foam.nanos.auth.AuthenticationException(getErrorMessage(x, user, la, t.getMessage()));
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
          name: 'identifier',
          type: 'String'
        }
      ],
      javaCode: `
        return (User) ((DAO) getLocalUserDAO())
          .inX(x)
          .find(
            AND(
              OR(
                EQ(User.EMAIL, identifier.toLowerCase()),
                EQ(User.USER_NAME, identifier)
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
          name: 'loginAttempts',
          type: 'LoginAttempts'
        }
      ],
      javaCode: `
        if ( loginAttempts == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        }
        return loginAttempts.getLoginAttempts() >= getMaxAttempts();
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
          name: 'loginAttempts',
          type: 'LoginAttempts'
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
        int remaining = getMaxAttempts() - loginAttempts.getLoginAttempts();
        if ( remaining > 0 ) {
          return "Login failed (" + reason + "). " + ( remaining ) + " attempts remaining.";
        } else {
          if ( isAdminUser(user) ){
            return "Account temporarily locked. You can attempt to login after " + getDateFormat().format(loginAttempts.getNextLoginAttemptAllowedAt());
          } else {
            return "Account locked. Please contact customer service." ;
          }
        }
      `
    },
    {
      name: 'resetLoginAttempts',
      documentation: 'Checks if login attempts have been modified, and resets them if they have been',
      type: 'LoginAttempts',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'loginAttempts',
          type: 'LoginAttempts'
        }
      ],
      javaCode: `
        if ( loginAttempts.getLoginAttempts() == 0 ) {
          return loginAttempts;
        }

        loginAttempts = loginAttempts.isFrozen() ? (LoginAttempts) loginAttempts.fclone() : loginAttempts;
        loginAttempts.setLoginAttempts((short) 0);
        loginAttempts.setNextLoginAttemptAllowedAt(new Date());
        return (LoginAttempts) ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).put(loginAttempts);
      `
    },
    {
      name: 'incrementLoginAttempts',
      documentation: 'Increments login attempts by 1',
      type: 'LoginAttempts',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'loginAttempts',
          type: 'LoginAttempts'
        }
      ],
      javaCode: `
        loginAttempts = loginAttempts.isFrozen() ? (LoginAttempts) loginAttempts.fclone() : loginAttempts;
        loginAttempts.setLoginAttempts((short) (loginAttempts.getLoginAttempts() + 1));
        return (LoginAttempts) ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).put(loginAttempts);
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
           name: 'loginAttempts',
           type: 'LoginAttempts'
         }
       ],
       javaCode: `
         loginAttempts = loginAttempts.isFrozen() ? (LoginAttempts) loginAttempts.fclone() : loginAttempts;
         Calendar cal = Calendar.getInstance();
         cal.add((Calendar.MINUTE), loginAttempts.getLoginAttempts() * getLoginDelayMultiplier());
         loginAttempts.setNextLoginAttemptAllowedAt(cal.getTime());
         ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).put(loginAttempts);
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
          name: 'loginAttempts',
          type: 'LoginAttempts'
        }
      ],
      javaCode: `
        if ( loginAttempts == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        }
        Calendar now = Calendar.getInstance();
        Calendar cal = Calendar.getInstance();
        cal.setTime(loginAttempts.getNextLoginAttemptAllowedAt());
        return now.compareTo(cal) > 0;
      `
    },
  ]
});
