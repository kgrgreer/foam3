foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'B2BTransactionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates bank to bank transaction via IdentityMind Transfer API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
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
          agent.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              requestApproval(x,
                new ComplianceApprovalRequest.Builder(x)
                  .setObjId(transaction.getId())
                  .setDaoKey("localTransactionDAO")
                  .setCauseId(response.getId())
                  .setCauseDaoKey("identityMindResponseDAO")
                  .build()
              );
            }
          });
        }
        ruler.putResult(status);
      `
    }
  ]
});
