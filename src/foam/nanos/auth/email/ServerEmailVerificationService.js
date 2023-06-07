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
    'foam.mlang.predicate.Predicate',
    'foam.util.SafetyUtil',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Random',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    { name: 'TIMEOUT', type: 'Integer', value: 30 },
    { name: 'DEFAULT_MAX_ATTEMPTS', type: 'Integer', value: 5 },
    { name: 'VERIFY_EMAIL_TEMPLATE', type: 'String', value: 'verifyEmailByCode' }
  ],

  messages: [
    { name: 'INVALID_CODE', message: 'This code is no longer valid.'},
    { name: 'INCORRECT_CODE', message: 'Incorrect code.'}
  ],

  methods: [
    {
      name: 'findUser',
      args: 'Context x, String identifier, String userName',
      type: 'foam.nanos.auth.User',
      javaCode: `
        String spid = (String) foam.core.XLocator.get().get("spid");
        Predicate identifierPredicate = SafetyUtil.isEmpty(userName) ? 
          OR(EQ(User.EMAIL, identifier), EQ(User.USER_NAME, identifier)) :
          AND(EQ(User.EMAIL, identifier), EQ(User.USER_NAME, userName));
        DAO userDAO = ((DAO) x.get("localUserDAO")).where(
          AND(
            identifierPredicate,
            EQ(User.LOGIN_ENABLED, true),
            OR(EQ(spid, null), EQ(User.SPID, spid)) // null check done for running in test mode as we don't always set up spid
          ))
          .limit(2);
        List list = ((ArraySink) userDAO.select(new ArraySink())).getArray();
        if ( list == null || list.size() == 0 ) {
          throw new UserNotFoundException();
        }

        if ( list.size() > 1 ) {
          ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "verifyByCode", "multiple valid users found for", identifier);

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
      name: 'verifyUserByCode',
      javaCode: `
        sendCode(x, user, emailTemplate);
      `
    },
    {
      name: 'verifyByCode',
      javaCode: `
        User user = findUser(x, identifier, userName);
        sendCode(x, user, emailTemplate);
      `
    },
    {
      name: 'sendCode',
      type: 'Void',
      args: 'Context x, User user, String emailTemplate',
      javaCode: `
        if ( SafetyUtil.isEmpty(emailTemplate) ) emailTemplate = this.VERIFY_EMAIL_TEMPLATE;
        Calendar calendar = Calendar.getInstance();
        calendar.add(java.util.Calendar.MINUTE, this.TIMEOUT);
        EmailVerificationCode code = new EmailVerificationCode.Builder(x)
          .setVerificationCode(generateCode())
          .setEmail(user.getEmail())
          .setUserName(user.getUserName())
          .setExpiry(calendar.getTime())
          .setVerificationAttempts(0)
          .setMaxAttempts(DEFAULT_MAX_ATTEMPTS)
          .build();

        DAO verificationCodeDAO = (DAO) x.get("emailVerificationCodeDAO");
        code = (EmailVerificationCode) verificationCodeDAO.put(code);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[]{user.getEmail()});
        message.setUser(user.getId());
        HashMap<String, Object> args = new HashMap<>();
        args.put("name", SafetyUtil.isEmpty(user.getFirstName()) ? user.getUserName() : user.getFirstName());
        args.put("code", code.getVerificationCode());
        args.put("expiry", code.getExpiry());
        args.put("templateSource", this.getClass().getName());
        args.put("template", emailTemplate);
        message.setTemplateArguments(args);
        ((DAO) getX().get("emailMessageDAO")).put(message);
      `
    },
    {
      name: 'verifyUserEmail',
      javaCode: `
        User user = findUser(x, identifier, userName);

        processCode(x, user, verificationCode);

        user = (User) user.fclone();
        user.setEmailVerified(true);
        ((DAO) x.get("localUserDAO")).put(user);
        return true;
      `
    },
    {
      name: 'verifyCode',
      javaCode: `
        User user = findUser(x, identifier, userName);
        return verifyCode(x, user, verificationCode);
      `
    },
    {
      name: 'generateCode',
      type: 'String',
      javaCode: `
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < 6; i++) {
          code.append(Integer.toString(new Random().nextInt(9)));
        }
        return code.toString();
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public void processCode(foam.core.X x, User user, String verificationCode) {
              try {
                verifyCode(x, user, verificationCode);
              } finally {
                var dao  = (DAO) x.get("emailVerificationCodeDAO");
                var code = (EmailVerificationCode) dao.find(AND(
                  EQ(EmailVerificationCode.EMAIL, user.getEmail()),
                  EQ(EmailVerificationCode.USER_NAME, user.getUserName())
                ));

                if ( code != null ) {
                  dao.remove(code);
                }
              }
            }

            public boolean verifyCode(foam.core.X x, User user, String verificationCode) {
              DAO verificationCodeDAO = (DAO) x.get("emailVerificationCodeDAO");
              Calendar c = Calendar.getInstance();
              EmailVerificationCode code = (EmailVerificationCode) verificationCodeDAO.find(AND(
                EQ(EmailVerificationCode.EMAIL, user.getEmail()),
                EQ(EmailVerificationCode.USER_NAME, user.getUserName()),
                GT(EmailVerificationCode.EXPIRY, c.getTime()),
                GT(EmailVerificationCode.MAX_ATTEMPTS, EmailVerificationCode.VERIFICATION_ATTEMPTS)
              ));

              if ( code == null )
                throw new VerificationCodeException(this.INVALID_CODE);

              if ( ! code.getVerificationCode().equals(verificationCode) ) {
                code = (EmailVerificationCode) code.fclone();
                code.setVerificationAttempts(code.getVerificationAttempts() + 1);
                verificationCodeDAO.put(code);

                var remaining = code.getMaxAttempts() - code.getVerificationAttempts();
                var exception = new VerificationCodeException(this.INCORRECT_CODE);
                exception.setRemainingAttempts(remaining);
                throw exception;
              }
              return true;
            }
          `
        }));
      }
    }
  ]
});

