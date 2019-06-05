foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BusinessComplianceRequested',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if business compliance is requested',

  javaImports: [
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(Business.class)), true),
          new UserComplianceRequested()
        ).f(obj);
      `
    }
  ]
});
