foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'B2BTransactionValidator',

  documentation: 'Validates bank to bank transaction via IdentityMind Transfer API.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
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
          ((Logger) x.get("logger")).error(
            "Transaction was denied by IdentityMind.", transaction);
          throw new RuntimeException("Failed to validate transaction.");
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
