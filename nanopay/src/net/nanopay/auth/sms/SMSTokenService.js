foam.CLASS({
  package: 'net.nanopay.auth.sms',
  name: 'SMSTokenService',

  documentation: 'Implementation of Token Service used for verifying SMS',

  implements: [
    'net.nanopay.auth.token.TokenService'
  ],

  methods: [
    {
      name: 'generateToken',
      javaCode: `return "";`
    },
    {
      name: 'processToken',
      javaCode: `return true;`
    }
  ]
});
