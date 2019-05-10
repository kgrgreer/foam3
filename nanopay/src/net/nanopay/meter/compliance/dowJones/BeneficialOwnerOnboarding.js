foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'BeneficialOwnerOnboarding',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.admin.model.ComplianceStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return AND(
          EQ(DOT(NEW_OBJ, INSTANCE_OF(BeneficialOwner.getOwnClassInfo())), true),
          EQ(DOT(NEW_OBJ, BeneficialOwner.COMPLIANCE), ComplianceStatus.REQUESTED),
          EQ(DOT(OLD_OBJ, BeneficialOwner.COMPLIANCE), ComplianceStatus.REQUESTED)
        ).f(obj);
      `
    }
  ]
});
