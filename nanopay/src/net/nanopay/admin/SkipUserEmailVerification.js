foam.CLASS({
  package: 'net.nanopay.admin',
  name: 'SkipUserEmailVerification',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Set user emailVerified to true.',

  javaImports: [
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof User ) {
          ((User) obj).setEmailVerified(true);
        }
      `
    }
  ]
});
