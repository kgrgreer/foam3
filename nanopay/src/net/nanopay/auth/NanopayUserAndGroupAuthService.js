foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'NanopayUserAndGroupAuthService',
  extends: 'foam.nanos.auth.UserAndGroupAuthService',
  flags: ['java'],

  documentation: `This class adds Nanopay specific user and group auth rules.`,

  imports: [
    'localUserDAO',
    'passwordEntropyService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.session.Session',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Password',
    'foam.util.SafetyUtil',

    'java.util.HashMap',

    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.Business',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR'
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

        User user = (User) ((DAO) getLocalUserDAO()).find(session.getUserId());

        // This case is for business user of sme
        if ( user instanceof Business) {
          user = (User) x.get("agent");
          user = (User) ((DAO) getLocalUserDAO()).find(user.getId());
        }

        if ( user == null ) {
          throw new AuthenticationException("User not found");
        }

        // check user status is not disabled
        if ( AccountStatus.DISABLED == user.getStatus() ) {
          throw new AuthenticationException("User disabled");
        }

        // check if user group enabled
        Group group = user.findGroup(x);
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
        user = (User) ((DAO) getLocalUserDAO()).put(user);

        // send user email to notify of password change
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        String url = appConfig.getUrl().replaceAll("/$", "");
        EmailMessage message = new EmailMessage();
        message.setTo(new String[] { user.getEmail() });
        HashMap<String, Object> args = new HashMap<>();
        args.put("name", user.getFirstName());
        args.put("sendTo", user.getEmail());
        args.put("link", url);

        EmailsUtility.sendEmailFromTemplate(x, user, message, "password-changed", args);

        return user;
      `
    },
    {
      name: 'login',
      javaCode: `
        return login_(x, id, password);
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
          type: 'String'
        },
        {
          name: 'password',
          type: 'String'
        }
      ],
      javaCode: `
        User user = getUser(x, id);

        if ( user == null ) {
          throw new AuthenticationException("User not found.");
        }

        Group group = user.findGroup(x);
        String supportEmail = (String) group.getSupportEmail();

        if (
          ! user.getLoginEnabled() ||
          ! user.getEnabled() ||
          user.getStatus() == AccountStatus.REVOKED ||
          user.getStatus() == AccountStatus.DISABLED
        ) {
          throw new AuthenticationException("Your account has been disabled. Please contact us at " + supportEmail + " for more information.");
        }

        return super.login(x, id, password);
      `
    },
    {
      name: 'getUser',
      documentation: 'Convenience method to get a user by username or email',
      type: 'foam.nanos.auth.User',
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
                EQ(foam.nanos.auth.User.EMAIL, id.toLowerCase()),
                EQ(foam.nanos.auth.User.USER_NAME, id)
              ),
              EQ(foam.nanos.auth.User.LOGIN_ENABLED, true)
            )
          );
      `
    }
  ]
});
