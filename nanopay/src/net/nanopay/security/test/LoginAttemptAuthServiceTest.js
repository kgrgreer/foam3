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
  package: 'net.nanopay.security.test',
  name: 'LoginAttemptAuthServiceTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.nanos.session.Session',
    'foam.core.X',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.AccountLockedException',
    'net.nanopay.security.auth.LoginAttempts',
    'net.nanopay.security.auth.AccountTemporarilyLockedException'
  ],

  constants: [
    {
      name: 'MAX_ATTEMPTS',
      value: 3,
      type: 'Short'
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up user dao
        x = x.put("localUserDAO", new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()));
        x = x.put("localLoginAttemptsDAO", new foam.dao.MDAO(LoginAttempts.getOwnClassInfo()));
        foam.dao.DAO userDAO = (foam.dao.DAO) x.get("localUserDAO");
        foam.dao.DAO loginAttemtpsDAO = (foam.dao.DAO) x.get("localLoginAttemptsDAO");
        resetLoginCount(x);

        // Override session user and context for tests
        Session session = x.get(Session.class);
        
        //save the actual Context
        long oldUserId = session.getUserId();
        X oldContext = session.getContext();
        
        session.setUserId(1000);
        session.setContext(session.applyTo(x));

        net.nanopay.security.auth.LoginAttemptAuthService auth;
        try {
          // set up login attempt auth service
          auth = new net.nanopay.security.auth.LoginAttemptAuthService.Builder(x)
            .setMaxAttempts(MAX_ATTEMPTS)
            .setDelegate(new foam.nanos.auth.UserAndGroupAuthService(x))
            .build();
          auth.start();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        try {
          // test login attempts reset by email
          Test_LoginAttemptAuthService_LoginAttemptsReset(x, auth, "kirk@nanopay.net", "login in by email");
          resetLoginCount(x);

          // test login by email
          Test_LoginAttemptAuthService_LoginAttemptsExceeded(x, auth, "kirk@nanopay.net", "login in by email");
          resetLoginCount(x);
        } finally {
          //set back the Context
          session.setUserId(oldUserId);
          session.setContext(oldContext);
        } 
      `
    },
    {
      name: 'Test_LoginAttemptAuthService_LoginAttemptsReset',
      documentation: 'Tests that the login attempts are reset',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'email',
          type: 'String'
        },
        {
          name: 'method',
          type: 'String'
        }
      ],
      javaCode: `
        try {
          // login with invalid credentials
          loginWithInvalidCredentials(x, auth, email);
        } catch ( Throwable ignored ) { }

        // verify login attempts increased
        test(verifyLoginAttempts(x, email, 1), "Login attempts is equal to 1 after using " + method);

        // login with valid credentials
        loginWithValidCredentials(x, auth, email);

        // verify login attempts reset
        test(verifyLoginAttempts(x, email, 0), "Login attempts is reset to 0 after using " + method);
      `
    },
    {
      name: 'Test_LoginAttemptAuthService_LoginAttemptsExceeded',
      documentation: 'Tests logging in and exceeding the allotted number of login attempts',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'email',
          type: 'String'
        },
        {
          name: 'method',
          type: 'String'
        }
      ],
      javaCode: `
        // test login
        for (int i = 1; i <= MAX_ATTEMPTS; i++) {
          try {
            // login with invalid credentials
            loginWithInvalidCredentials(x, auth, email);
          } catch ( Throwable t ) {
            // verify login attempts increased
            test(verifyLoginAttempts(x, email, i), "Login attempts is equal to " + i + " after using " + method);
          }
        }

        // attempt to exceed login attempts with invalid credentials
        // NOTE: Can't test date as it changes from actual exception.
        try {
          loginWithInvalidCredentials(x, auth, email);
          test(false, "LoginAttemptAuthService throws AccountTemporarilyLockedException with the message \\"You can login again after ..date..\\" with invalid credentials after using " + method);
        } catch (AccountTemporarilyLockedException e) {
          test(true, "LoginAttemptAuthService throws AccountTemporarilyLockedException with the message \\"You can login again after ..date..\\" with invalid credentials after using " + method);
        }

        LoginAttempts la = (LoginAttempts) getLoginAttempts(x, email).fclone();
        la.setLoginAttempts((short)100);
        ((foam.dao.DAO) x.get("loginAttemptsDAO")).put(la);

        // Admin users report AccountTemporarilyLockedException - when waiting on freeze window.  
        try {
          loginWithInvalidCredentials(x, auth, email);
          test(false, "LoginAttemptAuthService throws AccountTemporarilyLockedException with the message \\"You can login again after ..date..\\" with valid credentials after using " + method);
        } catch (AccountTemporarilyLockedException e) {
          test(true, "LoginAttemptAuthService throws AccountTemporarilyLockedException with the message \\"You can login again after ..date..\\" with valid credentials after using " + method);
        }
      `
    },
    {
      name: 'loginWithValidCredentials',
      documentation: 'Attempts to login with valid credentials',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'email',
          type: 'String'
        },
      ],
      javaCode: `
        auth.login(x, email, "Test123");
      `
    },
    {
      name: 'loginWithInvalidCredentials',
      documentation: 'Attempts to login with invalid credentials',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'auth',
          type: 'foam.nanos.auth.AuthService'
        },
        {
          name: 'email',
          type: 'String'
        },
      ],
      javaCode: `
        auth.login(x, email, "Test124");
      `
    },
    {
      name: 'verifyLoginAttempts',
      documentation: 'Verifies the amount of login attempts',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'email',
          type: 'String'
        },
        {
          name: 'attempts',
          type: 'Integer'
        }
      ],
      javaCode: `
        foam.nanos.auth.User user = (foam.nanos.auth.User)
          ((foam.dao.DAO) x.get("localUserDAO")).inX(x).find(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, email));
        if ( user != null ) {
          LoginAttempts loginAttempts = (LoginAttempts) ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).inX(x).find(user.getId());
          return loginAttempts != null &&
            loginAttempts.getLoginAttempts() == attempts;
        }
        return false;
      `
    },
    {
      name: 'resetLoginCount',
      documentation: 'Resets the user\'s login attempt counter',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
        ((foam.dao.DAO) x.get("localUserDAO")).inX(x).put(new foam.nanos.auth.User.Builder(x)
          .setId(1000)
          .setEmail("kirk@nanopay.net")
          .setGroup("admin")
          .setPassword(foam.util.Password.hash("Test123"))
          .setLifecycleState(LifecycleState.ACTIVE)
          .build());
   
        ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).inX(x).put(new LoginAttempts.Builder(x)
          .setId(1000)
          .setLoginAttempts((short) 0)
          .build());
      `
    },
    {
      name: 'getNextLoginAttemptAllowedAtMsg',
      documentation: 'Get user next login allowed time message',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'email',
          type: 'String'
        }
      ],
      javaCode: `
      try {
          LoginAttempts loginAttempts = getLoginAttempts(x, email);

          if ( loginAttempts != null ) {
            java.text.SimpleDateFormat df =  new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            df.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));
            AccountTemporarilyLockedException ex = new AccountTemporarilyLockedException();
            String msg = ex.getExceptionMessage();
            return msg.replace("{{message}}", df.format(loginAttempts.getNextLoginAttemptAllowedAt()));
          }
        } catch (Throwable t) {
          System.err.println(t.getMessage());
        }
        return "";
      `
    },
    {
      name: 'getLoginAttempts',
      documentation: '',
      type: 'LoginAttempts',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'email',
          type: 'String'
        }
      ],
      javaCode: `
        foam.dao.DAO userDAO = ((foam.dao.DAO) x.get("localUserDAO")).inX(x);
        foam.dao.DAO loginAttemptsDAO = ((foam.dao.DAO) x.get("localLoginAttemptsDAO")).inX(x);
        foam.nanos.auth.User user = (foam.nanos.auth.User)
          userDAO.find(foam.mlang.MLang.EQ(foam.nanos.auth.User.EMAIL, email));

        if ( user != null ) {
          return (LoginAttempts) loginAttemptsDAO.find(user.getId());
        }
        throw new RuntimeException("LoginAttempts not found");
        `
    }
  ]
});
