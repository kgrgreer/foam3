foam.CLASS({
  package: 'net.nanopay.onboarding',
  name: 'FirebaseInvitationTokenService',
  extends: 'foam.nanos.auth.token.AbstractTokenService',

  imports: [
    'localUserDAO',
    'tokenDAO'
  ],

  javaImports: [
    'java.util.Calendar'
  ],

  methods: [
    {
      name: 'generateExpiryDate',
      javaCode:
`Calendar calendar = Calendar.getInstance();
calendar.add(Calendar.DAY_OF_MONTH, 30);
return calendar.getTime();`
    },

    {
      name: 'generateTokenWithParameters',
      javaCode: `return false;`
    },

    {
      name: 'processToken',
      javaCode: `return false;`
    }
  ]
});