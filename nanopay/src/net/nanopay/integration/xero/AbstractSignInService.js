foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'AbstractSignInService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'net.nanopay.integration.xero.SignInService'
  ],

  javaImports: [
     'java.util.Calendar',
  ],

  methods: [
    {
      name: 'checkSignIn',
      javaCode: `return this.isSignedIn(x, user, null);`
    }
  ]
});