/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'ServerEmailVerificationService',
  implements: [ 'foam.nanos.auth.email.EmailVerificationService' ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.DuplicateEmailException',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserNotFoundException',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.email.EmailMessage',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Random',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    { name: 'TIMEOUT', type: 'Integer', value: 30 }
  ],

  messages: [
    { name: 'RESEND_MESSAGE', message: 'This code is no longer valid, a new code has been sent to your email address.'}
  ],

  methods: [
    {
      name: 'findUser',
      args: 'Context x, String email, String userName',
      type: 'foam.nanos.auth.User',
      javaCode: `
        DAO userDAO = ((DAO) x.get("localUserDAO")).where(
          AND(
            EQ(User.EMAIL, email),
            EQ(User.LOGIN_ENABLED, true)
          ));
        List list = ((ArraySink) userDAO.select(new ArraySink())).getArray();
        if ( list == null || list.size() == 0 ) {
          throw new UserNotFoundException();
        }

        if ( list.size() > 1 ) {
          ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "verifyByCode", "multiple valid users found for", email);

          if ( SafetyUtil.isEmpty(userName) ) throw new DuplicateEmailException();

          list = ((ArraySink) userDAO
            .where(EQ(User.USER_NAME, userName))
            .select(new ArraySink()))
            .getArray();
          if ( list == null || list.size() == 0 ) {
            throw new UserNotFoundException();
          }
        }
        return (User) list.get(0);
      `
    },
    {
      name: 'verifyByCode',
      javaCode: `
        User user = findUser(x, email, userName);
        sendCode(x, user);
      `
    },
    {
      name: 'sendCode',
      type: 'Void',
      args: 'Context x, User user',
      javaCode: `
        Calendar calendar = Calendar.getInstance();
        calendar.add(java.util.Calendar.MINUTE, this.TIMEOUT);
        EmailVerificationCode code = new EmailVerificationCode.Builder(x)
          .setVerificationCode(generateCode())
          .setEmail(user.getEmail())
          .setUserName(user.getUserName())
          .setExpiry(calendar.getTime())
          .build();
        
        DAO verificationCodeDAO = (DAO) x.get("emailVerificationCodeDAO");
        code = (EmailVerificationCode) verificationCodeDAO.put(code);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[]{user.getEmail()});
        message.setUser(user.getId());
        HashMap<String, Object> args = new HashMap<>();
        args.put("name", user.getUserName());
        args.put("code", code.getVerificationCode());
        args.put("expiry", code.getExpiry());
        args.put("templateSource", this.getClass().getName());
        args.put("template", "verifyEmailByCode");
        message.setTemplateArguments(args);
        ((DAO) getX().get("emailMessageDAO")).put(message);
      `
    },
    {
      name: 'verifyUserEmail',
      javaCode: `
        User user = findUser(x, email, userName);

        var res = verifyCode(x, email, userName, verificationCode);

        if ( res ) {
          user = (User) user.fclone();
          user.setEmailVerified(true);
          ((DAO) x.get("localUserDAO")).put(user);
        } else {
          sendCode(x, user);
          throw new AuthenticationException(this.RESEND_MESSAGE);
        }
        return res;
      `
    },
    {
      name: 'verifyCode',
      javaCode: `
        DAO verificationCodeDAO = (DAO) x.get("emailVerificationCodeDAO");
        Calendar c = Calendar.getInstance();

        EmailVerificationCode code = (EmailVerificationCode) verificationCodeDAO.find(AND(
          EQ(EmailVerificationCode.EMAIL, email),
          EQ(EmailVerificationCode.USER_NAME, userName),
          EQ(EmailVerificationCode.VERIFICATION_CODE, verificationCode),
          GT(EmailVerificationCode.EXPIRY, c.getTime())
        ));
        return code != null;
      `
    },
    {
      name: 'generateCode',
      type: 'String',
      javaCode: `
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 4; i++) {
          code.append(Integer.toString(new Random().nextInt(9)));
        }
        return code.toString();
      `
    }
  ]
});

