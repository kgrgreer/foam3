foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'IsExpediteCICOApprovalRequest',

  documentation: 'Returns true if new object is an approval request of type ExpediteCICOApprovalRequest',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.tx.ExpediteCICOApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, INSTANCE_OF(ExpediteCICOApprovalRequest.class)), true
        ).f(obj);
      `
    }
  ]
});
