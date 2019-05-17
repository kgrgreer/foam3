foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'BeneficialOwnerComplianceRequested',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if benefial owner compliance is requested',

  javaImports: [
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.BeneficialOwner',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return EQ(
          DOT(NEW_OBJ, BeneficialOwner.COMPLIANCE), ComplianceStatus.REQUESTED
        ).f(obj);
      `
    }
  ]
});
