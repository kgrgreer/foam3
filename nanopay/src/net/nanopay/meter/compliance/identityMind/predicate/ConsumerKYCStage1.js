foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind.predicate',
  name: 'ConsumerKYCStage1',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, CLASS_OF(User.class)), true
        ).f(obj);
      `
    }
  ]
});
