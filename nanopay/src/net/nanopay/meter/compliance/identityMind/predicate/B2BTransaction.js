foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind.predicate',
  name: 'B2BTransaction',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.AbliiTransaction',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, INSTANCE_OF(AbliiTransaction.class)), true
        ).f(obj);
      `
    }
  ]
});
