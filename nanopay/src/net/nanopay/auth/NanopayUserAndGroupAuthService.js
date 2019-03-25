foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'NanopayUserAndGroupAuthService',
  extends: 'foam.nanos.auth.UserAndGroupAuthService',
  flags: ['java'],

  documentation: `This class adds Nanopay specific user and group auth rules.`,

  imports: [
    'localUserDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.nanos.session.Session',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',

    'net.nanopay.model.Business',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.passwordutil.PasswordEntropy'
  ],

  properties: [
    {
      javaType: 'java.util.regex.Pattern',
      name: 'alphanumeric',
      documentation: `pattern used to check if password has only alphanumeric
        characters`,
      javaFactory: `
        java.util.regex.Pattern.compile("[^a-zA-Z0-9]");
      `
    }
  ],

  methods: [
    {
      name: 'updatePassword',
      documentation: `Given a context with a user, validate the password to be
      updated and return a context with the updated user information. If it is a
      businessUser, replace user with agent.`,
      javaCode: `
        if ( x == null || SafetyUtil.isEmpty(oldPassword) || SafetyUtil.isEmpty(newPassword) ) {
          throw new RuntimeException("Invalid parameters");
        }

        Session session = x.get(Session.class);
        if ( session == null || session.getUserId() == 0 ) {
          throw new AuthenticationException("User not found");
        }

        User user = (User) userDAO_.find(session.getUserId());

        // This case is for business user of sme
        if ( user instanceof Business) {
          user = (User) x.get("agent");
        }

        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check user status is not disabled
        if ( AccountStatus.DISABLED == user.getStatus() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user group enabled
        Group group = (Group) groupDAO_.find(user.getGroup());
        if ( group != null && ! group.getEnabled() ) {
          throw new AuthenticationException("User group disabled");
        }

        // old password does not match
        if ( ! Password.verify(oldPassword, user.getPassword()) ) {
          throw new RuntimeException("Old password is incorrect");
        }

        // new password is the same
        if ( Password.verify(newPassword, user.getPassword()) ) {
          throw new RuntimeException("New password must be different");
        }

        // store new password in DAO and put in context
        user = (User) user.fclone();
        user.setDesiredPassword(newPassword);
        // TODO: modify line to allow actual setting of password expiry in cases where users are required to periodically update their passwords
        user.setPasswordExpiry(null);
        user = (User) userDAO_.put(user);
        session.setContext(session.getContext().put("user", user));
        return user;
      `
    },
    {
      name: 'validatePassword',
      javaCode: `
        PasswordEntropy passwordEntropy = (PasswordEntropy) getX().get("passwordEntropyService");

        if ( SafetyUtil.isEmpty(potentialPassword) ) {
          throw new RuntimeException("Password is required");
        }
        if ( passwordEntropy.getPasswordStrength(potentialPassword) < 3 ) {
          throw new RuntimeException("Password is not strong enough.");
        }
      `
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
      documentation: 'Helper logic function to reduce code duplication.',
      type: 'foam.nanos.auth.User',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Any'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaCode: `
        // check login attempts
        foam.nanos.auth.User user = ( id instanceof String ) ?
          getUserByEmail(x, (String) id) : getUserById(x, (long) id);

        if ( user == null ) {
          throw new foam.nanos.auth.AuthenticationException("User not found.");
        }

        Group group = (Group) ((foam.dao.DAO) x.get("groupDAO")).inX(x).find(user.getGroup());
        String supportEmail = (String) group.getSupportEmail();

        if ( ! user.getLoginEnabled() || ! user.getEnabled() ) {
          throw new foam.nanos.auth.AuthenticationException("Your account has been disabled. Please contact us at " + supportEmail + " for more information.");
        }

        return (id instanceof String) ?
          super.loginByEmail(x, (String) id, password) :
          super.login(x, (long) id, password);
      `
    },
    {
      name: 'getUserById',
      documentation: 'Convenience method to get a user by id',
      type: 'foam.nanos.auth.User',
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
        return (foam.nanos.auth.User) ((foam.dao.DAO) getLocalUserDAO()).inX(x).find(id);
      `
    },
    {
      name: 'getUserByEmail',
      documentation: 'Convenience method to get a user by email',
      type: 'foam.nanos.auth.User',
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
        foam.dao.DAO localUserDAO = (foam.dao.DAO) getLocalUserDAO();
        return (foam.nanos.auth.User) localUserDAO
          .inX(x)
          .find(
            AND(
              EQ(foam.nanos.auth.User.EMAIL, email.toLowerCase()),
              EQ(foam.nanos.auth.User.LOGIN_ENABLED, true)
            )
          );
      `
    }
  ]
});
