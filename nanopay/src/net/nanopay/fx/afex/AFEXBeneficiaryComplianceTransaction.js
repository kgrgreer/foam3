foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBeneficiaryComplianceTransaction',
  extends: 'net.nanopay.tx.ComplianceTransaction',

  documentation: `Transaction to be created specifically for AFEX Beneficiaries, to stop payments from being created until a beneficiary is approved`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.fx.afex.AFEXBeneficiary',
      targetDAOKey: 'afexBeneficiaryDAO',
      name: 'BeneficiaryId',
    }
  ]
});
