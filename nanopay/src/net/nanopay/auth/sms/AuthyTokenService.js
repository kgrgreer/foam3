foam.CLASS({
  package: 'net.nanopay.auth.sms',
  name: 'AuthyTokenService',
  extends: 'net.nanopay.auth.token.AbstractTokenService',

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
      class: 'Object',
      name: 'client',
      javaType: 'com.authy.AuthyApiClient',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'debug'
    },
    {
      class: 'String',
      name: 'apiHost'
    },
    {
      class: 'String',
      name: 'apiKey'
    }
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode:
`AuthyApiClient client = getClient();
if ( client == null ) {
  return null;
}

// don't send token if already verified
Phone phone = user.getPhone();
if ( phone.getVerified() ) {
  return null;
}

// TODO: Remove hardcoded country code of 1
PhoneVerification phoneVerification = client.getPhoneVerification();
Verification verification = phoneVerification.start(phone.getNumber(), "1", "sms", new Params());
return verification.getSuccess();`
    },
    {
      name: 'processToken',
      javaCode:
`DAO userDAO = (DAO) getX().get("userDAO");
AuthyApiClient client = getClient();
if ( client == null ) {
  return false;
}

// if already verified, return true
Phone phone = user.getPhone();
if ( phone.getVerified() ) {
  return true;
}

// TODO: Remove hardcoded country code of 1
PhoneVerification phoneVerification = client.getPhoneVerification();
Verification verification = phoneVerification.check(phone.getNumber(), "1", token);
if ( verification.isOk() ) {
  phone.setVerified(true);
  user.setPhone(phone);
  userDAO.put(user);
  return true;
} else {
  return false;
}`
    },
    {
      name: 'start',
      javaCode: 'setClient(new AuthyApiClient(getApiKey(), getApiHost(), getDebug()));'
    }
  ]
});
