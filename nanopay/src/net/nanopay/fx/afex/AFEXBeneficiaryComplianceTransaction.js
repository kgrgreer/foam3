foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'AFEXBeneficiaryComplianceTransaction',
  extends: 'net.nanopay.tx.ComplianceTransaction',

  documentation: `Transaction to be created specifically for AFEX Beneficiaries, to stop payments from being created until a beneficiary is approved`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.notification.Notification',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.fx.afex.AFEXBeneficiary',
      name: 'BeneficiaryId',
    }
  ]
});
