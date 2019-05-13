foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'B2BTransactionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates bank to bank transaction via IdentityMind Transfer API.',

  javaImports: [
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
        IdentityMindResponse response = identityMindService.evaluateTransfer(x, transaction);
        ComplianceValidationStatus status = response.getComplianceValidationStatus();

        if ( status != ComplianceValidationStatus.VALIDATED ) {
          requestApproval(x, transaction, "localTransactionDAO");
        }
        ruler.putResult(status);
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '//noop'
    }
  ]
});
