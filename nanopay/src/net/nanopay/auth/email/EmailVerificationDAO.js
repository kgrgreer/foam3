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
  package: 'net.nanopay.auth.email',
  name: 'EmailVerificationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.auth.email.EmailTokenService',
    'foam.nanos.logger.Logger'
  ],

  constants: [
    {
      name: 'REGISTRATION_EMAIL_ENABLED',
      type: 'String',
      value: 'registration.email.enabled'
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.email.EmailTokenService',
      name: 'emailToken'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.email.EmailTokenService',
      name: 'inviteToken'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public EmailVerificationDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setEmailToken((EmailTokenService) x.get("emailToken"));
            setInviteToken((EmailTokenService) x.get("inviteToken"));
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ((User) obj).getLoginEnabled() ) {
          return super.put_(x, obj);
        }

        boolean newUser = getDelegate().find(((User) obj).getId()) == null;
        AuthService auth = (AuthService) x.get("auth");
        boolean registrationEmailEnabled = auth.check(x, REGISTRATION_EMAIL_ENABLED);
        User result = (User) super.put_(x, obj);

        // Send email verification if new registered user's email enabled
        if ( result != null &&
             newUser &&
             ! result.getEmailVerified() &&
             registrationEmailEnabled &&
             ! result.getInvited() ) {
          AppConfig appConfig = (AppConfig) x.get("appConfig");
          if ( appConfig.getMode() == Mode.DEVELOPMENT ||
               appConfig.getMode() == Mode.STAGING ) {
            Logger logger = (Logger) x.get("logger");
            logger.warning(this.getClass().getSimpleName(), "Auto email verified.", "user", result.getId());
            result = (User) result.fclone();
            result.setEmailVerified(true);
            result = (User) getDelegate().put_(x, result);
          } else {
            getEmailToken().generateToken(x, result);
          }
        }

        return result;
      `
    }
  ]
});
