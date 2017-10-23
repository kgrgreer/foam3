foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'EmailTokenService',

  documentation: 'Implementation of Token Service used for verifying email addresses',

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
