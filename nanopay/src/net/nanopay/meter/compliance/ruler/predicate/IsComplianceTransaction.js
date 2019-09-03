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

  properties: [
    {
      class: 'Class',
      name: 'of',
      javaFactory: 'return ComplianceTransaction.getOwnClassInfo();'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, CLASS_OF(getOf().getObjClass())), true
        ).f(obj);
      `
    }
  ]
});
