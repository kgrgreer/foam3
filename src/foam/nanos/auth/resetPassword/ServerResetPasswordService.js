/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ServerResetPasswordService',
  implements: [ 'foam.nanos.auth.resetPassword.ResetPasswordService' ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.email.EmailVerificationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'resetPassword',
      javaCode: `
        EmailVerificationService service = (EmailVerificationService) x.get("emailVerificationService");
        if ( service.verifyCode(x, newPasswordObj.getEmail(), newPasswordObj.getResetPasswordCode()) ) {
          String desiredPassword = newPasswordObj.getNewPassword();

          User systemUser = ((Subject) getX().get("subject")).getUser();
          Subject subject = new Subject.Builder(x).setUser(systemUser).build();
          x = x.put("subject", subject);
  
          DAO userDAO = (DAO) x.get("localUserDAO");
          User user = (User) userDAO.find(EQ(foam.nanos.auth.User.EMAIL, newPasswordObj.getEmail()));
          user = (User) user.fclone();
          user.setDesiredPassword(desiredPassword);
          userDAO.put_(x, user);
        } else {
          throw new AuthorizationException("Email verification failed");
        }
      `
    }
  ]
});
