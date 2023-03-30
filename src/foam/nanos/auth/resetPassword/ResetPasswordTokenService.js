/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for reset password',

  imports: [
    'appConfig',
    'Email email',
    'DAO localUserDAO',
    'DAO tokenDAO'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserNotFoundException',
    'foam.nanos.auth.token.Token',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.Email',
    'foam.util.Emails.EmailsUtility',
    'foam.util.Password',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.UUID'
  ],

  methods: [
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        String url = appConfig.getUrl().replaceAll("/$", "");

        // The context passed to us won't have a user in it because obviously the user
        // isn't logged in if they're resetting their password. However, decorators on
        // DAOs we access down the line from here will want to use the user from the
        // context. Therefore we put the system user in the context here so that
        // decorators down the line won't throw NPEs when trying to access the user in
        // the context.
        User systemUser = ((Subject) getX().get("subject")).getUser();
        Subject subject = new Subject.Builder(x).setUser(systemUser).build();
        x = x.put("subject", subject);

        DAO userDAO = (DAO) getLocalUserDAO();
        DAO tokenDAO = (DAO) getTokenDAO();

        // check if email invalid
        if ( user == null || ! Email.isValid(user.getEmail()) ) {
          throw new RuntimeException("Invalid Email");
        }

        Sink sink = new ArraySink();
        sink = userDAO.where(MLang.EQ(User.EMAIL, user.getEmail()))
           .limit(1).select(sink);

        List list = ((ArraySink) sink).getArray();
        if ( list == null || list.size() == 0 ) {
          throw new UserNotFoundException();
        }

        user = (User) list.get(0);
        if ( user == null ) {
          throw new UserNotFoundException();
        }

        Token token = new Token();
        token.setUserId(user.getId());
        token.setExpiry(generateExpiryDate());
        token.setData(UUID.randomUUID().toString());
        token.setParameters(parameters);
        token = (Token) tokenDAO.put(token);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[] { user.getEmail() });
        message.setUser(user.getId());
        HashMap<String, Object> args = new HashMap<>();
        args.put("name", String.format("%s %s", user.getFirstName(), user.getLastName()));
        args.put("link", url +"?token=" + token.getData() + getMenu(parameters));
        args.put("templateSource", this.getClass().getName());
        String templateName = getTemplateName(parameters);
        args.put("template", templateName);

        EmailsUtility.sendEmailFromTemplate(x, user, message, templateName, args);
        return true;
      `
    },
    {
      name: 'processToken',
      javaCode: `
        if ( user == null || SafetyUtil.isEmpty(user.getDesiredPassword()) ) {
          throw new RuntimeException("Cannot leave new password field empty");
        }

        // The context passed to us won't have a user in it because obviously the user
        // isn't logged in if they're resetting their password. However, decorators on
        // DAOs we access down the line from here will want to use the user from the
        // context. Therefore we put the system user in the context here so that
        // decorators down the line won't throw NPEs when trying to access the user in
        // the context.
        AppConfig appConfig = (AppConfig) x.get("appConfig");
        User systemUser = ((Subject) getX().get("subject")).getUser();
        Subject subject = new Subject.Builder(x).setUser(systemUser).build();
        x = x.put("subject", subject);


        String newPassword = user.getDesiredPassword();
        String url = appConfig.getUrl().replaceAll("/$", "");

        DAO userDAO = (DAO) getLocalUserDAO();
        DAO tokenDAO = (DAO) getTokenDAO();
        Calendar calendar = Calendar.getInstance();

        Sink sink = new ArraySink();
        sink = tokenDAO.where(MLang.AND(
          MLang.EQ(Token.PROCESSED, false),
          MLang.GT(Token.EXPIRY, calendar.getTime()),
          MLang.EQ(Token.DATA, token)
        )).limit(1).select(sink);

        List data = ((ArraySink) sink).getArray();
        if ( data == null || data.size() == 0 ) {
          throw new RuntimeException("Token not found");
        }



        // find user from token
        Token tokenResult = (Token) data.get(0);
        User userResult = (User) userDAO.find(tokenResult.getUserId());
        if ( userResult == null ) {
          throw new UserNotFoundException();
        }

        if ( ! Password.isValid(x, userResult, newPassword) ) {
          throw new RuntimeException("Invalid password");
        }

        // update user's password
        userResult = (User) userResult.fclone();
        userResult.setDesiredPassword(newPassword);
        user.setPasswordExpiry(null);

        boolean enableLogin = false;
        if ( tokenResult.getParameters() != null
          && tokenResult.getParameters().get("enableLogin") != null ) {
          enableLogin = Boolean.valueOf(tokenResult.getParameters().get("enableLogin").toString());
        }

        if ( ! userResult.getLoginEnabled() && enableLogin ) {
          userResult.setLoginEnabled(true);
        }
        userDAO.put(userResult);

        // set token processed to true
        tokenResult = (Token) tokenResult.fclone();
        tokenResult.setProcessed(true);
        tokenDAO.put(tokenResult);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[] { userResult.getEmail() });
        message.setUser(userResult.getId());
        HashMap<String, Object> args = new HashMap<>();
        args.put("name", userResult.getFirstName());
        args.put("sendTo", userResult.getEmail());
        args.put("link", url);
        args.put("templateSource", this.getClass().getName());
        args.put("template", "password-changed");
        message.setTemplateArguments(args);
        ((DAO) x.get("emailMessageDAO")).put(message);
        return true;
      `
    },
    {
      name: 'getMenu',
      type: 'String',
      args: 'Map parameters',
      javaCode: `
        if ( parameters != null && parameters.get("menu") != null ) {
          return parameters.get("menu").toString();
        }

        return "#reset";
      `
    },
    {
      name: 'getTemplateName',
      type: 'String',
      args: 'Map parameters',
      javaCode: `
        if ( parameters != null && parameters.get("templateName") != null ) {
          return parameters.get("templateName").toString();
        }

        return "reset-password";
      `
    }
  ]
});
