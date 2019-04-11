foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind.predicate',
  name: 'EntityLoginStage2',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.auth.LoginAttempt',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, LoginAttempt.LOGIN_SUCCESSFUL), true
        ).f(obj);
      `
    }
  ]
});
