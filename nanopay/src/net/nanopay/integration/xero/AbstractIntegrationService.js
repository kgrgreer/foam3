foam.CLASS({
  package: 'net.nanopay.integration.xero',
  name: 'AbstractIntegrationService',
  abstract: true,

  documentation: 'Abstract implementation of Token Service',

  implements: [
    'net.nanopay.integration.xero.IntegrationService'
  ],

  javaImports: [
     'java.util.Calendar',
  ],

  methods: [
    {
      name: 'checkSignIn',
      javaCode: `return this.isSignedIn(x, user, null);`
    },
    {
      name: 'sync',
      javaCode: `return this.syncSys(x, user, null);`
    }
  ]
});
