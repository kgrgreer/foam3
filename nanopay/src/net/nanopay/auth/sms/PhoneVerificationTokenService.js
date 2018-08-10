foam.CLASS({
  package: 'net.nanopay.auth.sms',
  name: 'PhoneVerificationTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  documentation: 'Implementation of Token Service used for verifying SMS',

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'com.authy.AuthyApiClient',
    'com.authy.api.Params',
    'com.authy.api.PhoneVerification',
    'com.authy.api.Verification',
    'foam.dao.DAO',
    'foam.nanos.auth.Phone'
  ],

  properties: [
    {
      class: 'String',
      name: 'accountSid',
    },
    {
      class: 'String',
      name: 'authToken'
    },
    {
      class: 'String',
      name: 'phoneNumber'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        Twilio.init(getAccountSid(), getAuthToken());
      `
    },
    {
      name: 'generateTokenWithParameters',
      javaCode: `
        AuthyApiClient client = getClient();
        // don't send token if already verified
        Phone phone = user.getPhone();
        if ( phone.getVerified() ) {
          throw new RuntimeException("Phone already verified");
        }

        // TODO: Remove hardcoded country code of 1
        PhoneVerification phoneVerification = client.getPhoneVerification();
        Verification verification = phoneVerification.start(phone.getNumber(), "1", "sms", new Params());
        if ( ! Boolean.parseBoolean(verification.getSuccess()) ) {
          throw new RuntimeException(verification.getMessage());
        }
        return true;
      `
    },
    {
      name: 'processToken',
      javaCode: `
        DAO userDAO = (DAO) getX().get("localUserDAO");
        AuthyApiClient client = getClient();
        // if already verified, return true
        Phone phone = user.getPhone();
        if ( phone.getVerified() ) {
          throw new RuntimeException("Phone already verified");
        }

        // TODO: Remove hardcoded country code of 1
        PhoneVerification phoneVerification = client.getPhoneVerification();
        Verification verification = phoneVerification.check(phone.getNumber(), "1", token);
        if ( ! verification.isOk() ) {
          throw new RuntimeException("Error validating code");
        }

        phone.setVerified(true);
        user.setPhone(phone);
        userDAO.put(user);
        return true;
      `
    }
  ]
});
