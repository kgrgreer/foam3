foam.CLASS({
  package: 'net.nanopay.admin',
  name: 'SkipUserEmailVerification',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ((User) obj).setEmailVerified(true);
      `
    }
  ]
});
