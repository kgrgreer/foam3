foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'LoginSuccess',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if user login successfully',

  javaImports: [
    'net.nanopay.auth.LoginAttempt',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, LoginAttempt.LOGIN_SUCCESSFUL), true),
          EQ(DOT(NEW_OBJ, LoginAttempt.GROUP), "sme"),
          EQ(OLD_OBJ, null)
        ).f(obj);
      `
    }
  ]
});
