foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'UserComplianceRulePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.mlang.ContextObject',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return OR(
          EQ(OLD_OBJ, null),
          EQ(new ContextObject("isScheduledRule"), true),
          AND(
            OR(
              NEQ(DOT(NEW_OBJ, User.FIRST_NAME), DOT(OLD_OBJ, User.FIRST_NAME)),
              NEQ(DOT(NEW_OBJ, User.LAST_NAME), DOT(OLD_OBJ, User.LAST_NAME)),
              NEQ(DOT(NEW_OBJ, User.ORGANIZATION), DOT(OLD_OBJ, User.ORGANIZATION))
            ),
            EQ(DOT(NEW_OBJ, User.COMPLIANCE), DOT(OLD_OBJ, User.COMPLIANCE))
          )
        ).f(obj);
      `
    }
  ]
});
