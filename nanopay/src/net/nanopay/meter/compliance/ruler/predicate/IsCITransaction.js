foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsCITransaction',

  documentation: 'Returns true if new object is a CITransaction',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.cico.CITransaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, INSTANCE_OF(CITransaction.class)), true
        ).f(obj);
      `
    }
  ]
});
