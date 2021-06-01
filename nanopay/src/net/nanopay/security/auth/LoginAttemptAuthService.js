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
    'foam.i18n.TranslationService',
    'foam.nanos.auth.AccessDeniedException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.util.SafetyUtil',
    'net.nanopay.admin.model.AccountStatus',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.CLASS_OF',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
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
      documentation: 'delay between logins in minutes',
      class: 'Short',
      name: 'loginDelay',
      value: 1
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
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


        // TODO: auth.checks are not working, wrong context.
        try {
          // attempt to login in, on success reset the login attempts
          user = super.login(x, identifier, password);

          if ( super.check(x, "loginattempts.lock.time") ||
               "admin".equals(user.getGroup()) ) {
            if ( ! loginFreezeWindowReached(la) ) {
              throw new Throwable();
            }
          } else {
            int remaining = getMaxAttempts() - la.getLoginAttempts();
            if ( remaining <= 0 ) {
              throw new Throwable();
            }
          }

          resetLoginAttempts(x, la);
          return user;
        } catch ( AccessDeniedException t ) {
          // TODO: don't allow admin to be locked out when accessed from restricted network.
          throw t;
        } catch ( Throwable t ) {
          if ( user == null ) {
            /*
              We check for invalid users in NanopayUserAndGroupAuthService.
              This gets caught here, hence the rethrow.
            */
            if ( t instanceof RuntimeException ) {
              throw (RuntimeException) t;
            }
            throw new RuntimeException(t.getMessage(), t);
          }

          try {
            if ( super.check(x, "loginattempts.notclustered") ||
                 "admin".equals(user.getGroup()) ) {
              la.setClusterable(false);
            }

            la = incrementLoginAttempts(x, la);
            int remaining = getMaxAttempts() - la.getLoginAttempts();
            if ( remaining > 0 ) {
              throw new net.nanopay.security.auth.InvalidPasswordException(String.valueOf(remaining));
            }

            if ( super.check(x, "loginattempts.lock.time") ||
                 "admin".equals(user.getGroup()) ) {
              la = incrementNextLoginAttemptAllowedAt(x, la);
              throw new net.nanopay.security.auth.AccountTemporarilyLockedException(getDateFormat().format(la.getNextLoginAttemptAllowedAt()));
            }

            throw new foam.nanos.auth.AccountLockedException();
          } finally {
            super.logout(x);
          }
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
          throw new foam.nanos.auth.UserNotFoundException();
        }
        return loginAttempts.getLoginAttempts() >= getMaxAttempts();
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
         java.util.Date now = new Date();
         Calendar cal = Calendar.getInstance();
         cal.setTime(loginAttempts.getNextLoginAttemptAllowedAt());
         if ( cal.getTime().getTime() < now.getTime() ) {
           cal.setTime(now);
         }
         cal.add((Calendar.MINUTE), getLoginDelay());
         loginAttempts.setNextLoginAttemptAllowedAt(cal.getTime());
         return (LoginAttempts) ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).put(loginAttempts);
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
          throw new foam.nanos.auth.UserNotFoundException();
        }
        return loginAttempts.getNextLoginAttemptAllowedAt().getTime() < System.currentTimeMillis();
      `
    },
  ]
});
