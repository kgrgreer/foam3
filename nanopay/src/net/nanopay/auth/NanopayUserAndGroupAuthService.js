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
  package: 'net.nanopay.auth',
  name: 'NanopayUserAndGroupAuthService',
  extends: 'foam.nanos.auth.UserAndGroupAuthService',
  flags: ['java'],

  documentation: `This class adds Nanopay specific user and group auth rules.`,

  imports: [
    'passwordEntropyService'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.app.SupportConfig',
    'foam.nanos.session.Session',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',

    'java.util.HashMap',

    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.model.Business',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'static foam.mlang.MLang.CLASS_OF'
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
          user = ((Subject) x.get("subject")).getRealUser();
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
        String url = user.findGroup(x).getAppConfig(x).getUrl();
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
        return login_(x, identifier, password);
      `
    },
    {
      name: 'login_',
      documentation: 'Helper logic function to reduce code duplication.',
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
        User user = getUser(x, identifier);

        if ( user == null ) {
          throw new AuthenticationException("User not found.");
        }

        X userX = x.put("subject", new Subject.Builder(x).setUser(user).build());
        Group group = user.findGroup(userX);
        if ( group == null ) {
          Alarm alarm = new Alarm("User Configuration", AlarmReason.CONFIGURATION);
          alarm.setNote("User " + user.getId() + " does not have a group assigned");
          ((DAO) x.get("alarmDAO")).put(alarm);
          throw new AuthenticationException("There was an issue logging in");
        }

        Theme theme = ((Themes) x.get("themes")).findTheme(userX);
        SupportConfig supportConfig = theme.getSupportConfig();
        String supportEmail = (String) supportConfig.getSupportEmail();

        if (
          ! user.getLoginEnabled() ||
          ! user.getEnabled() ||
          user.getStatus() == AccountStatus.REVOKED ||
          user.getStatus() == AccountStatus.DISABLED
        ) {
          throw new AuthenticationException("Your account has been disabled. Please contact us at " + supportEmail + " for more information.");
        }

        return super.login(x, identifier, password);
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
    }
  ]
});
