foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind.predicate',
  name: 'MerchantKYCStage3',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

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
          EQ(DOT(NEW_OBJ, Business.COMPLIANCE), ComplianceStatus.REQUESTED),
          OR(
            EQ(OLD_OBJ, null),
            NEQ(DOT(OLD_OBJ, Business.COMPLIANCE), ComplianceStatus.REQUESTED)
          )
        ).f(obj);
      `
    }
  ]
});
