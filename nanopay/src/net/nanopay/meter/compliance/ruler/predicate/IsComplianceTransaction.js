foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsComplianceTransaction',

  documentation: 'Returns true if new object is a ComplianceTransaction.',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.ComplianceTransaction',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, INSTANCE_OF(ComplianceTransaction.class)), true
        ).f(obj);
      `
    }
  ]
});
