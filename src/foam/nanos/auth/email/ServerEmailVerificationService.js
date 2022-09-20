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
    'foam.dao.DAO',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserNotFoundException',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.Random',
    'static foam.mlang.MLang.*'
  ],

  constants: [
    { name: 'TIMEOUT', type: 'Integer', value: 1 }
  ],

  messages: [
    { name: 'RESEND_MESSAGE', message: 'This code is no longer valid, a new code has been sent to your email address.'}
  ],

  methods: [
    {
      name: 'verifyByCode',
      type: 'Void',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' }
      ],
      javaCode: `
        Calendar calendar = Calendar.getInstance();
        calendar.add(java.util.Calendar.MINUTE, this.TIMEOUT);
        EmailVerificationCode code = new EmailVerificationCode.Builder(x)
          .setVerificationCode(generateCode())
          .setEmail(user.getEmail())
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
      name: 'verifyCode',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'email', type: 'String' },
        { name: 'verificationCode', type: 'String' }
      ],
      javaCode: `
        DAO verificationCodeDAO = (DAO) x.get("emailVerificationCodeDAO");
        Calendar c = Calendar.getInstance();

        DAO userDAO = (DAO) x.get("localUserDAO");
        User user = (User) userDAO.find(EQ(User.EMAIL, email));
        if ( user ==  null ) throw new UserNotFoundException();

        EmailVerificationCode code = (EmailVerificationCode) verificationCodeDAO.find(AND(
          EQ(EmailVerificationCode.EMAIL, email),
          EQ(EmailVerificationCode.VERIFICATION_CODE, verificationCode),
          GT(EmailVerificationCode.EXPIRY, c.getTime())
        ));
        if ( code != null ) {
          user = (User) user.fclone();
          user.setEmailVerified(true);
          userDAO.put(user);
        } else {
          verifyByCode(x, user);
          throw new AuthenticationException(this.RESEND_MESSAGE);
        }
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

