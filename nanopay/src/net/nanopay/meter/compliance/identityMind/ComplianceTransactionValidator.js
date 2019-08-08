foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ComplianceTransactionValidator',
  extends: 'net.nanopay.meter.compliance.identityMind.AbstractIdentityMindComplianceRuleAction',

  documentation: 'Validates transaction via IdentityMind Transfer API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Transaction transaction = (Transaction) obj;
          ComplianceValidationStatus status = ComplianceValidationStatus.PENDING;
          ComplianceApprovalRequest approvalRequest =
            new ComplianceApprovalRequest.Builder(x)
              .setObjId(transaction.getId())
              .setDaoKey("localTransactionDAO")
              .setClassification("Validate Transaction Using IdentityMind")
              .build();

          // NOTE: Only run transaction evaluation through IdentityMind
          // when it is a bank to bank transaction.
          if ( transaction.findSourceAccount(x) instanceof BankAccount
            && transaction.findDestinationAccount(x) instanceof BankAccount
          ) {
            IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");
            IdentityMindResponse response = identityMindService.evaluateTransfer(x, transaction);
            status = response.getComplianceValidationStatus();
            approvalRequest.setCauseId(response.getId());
            approvalRequest.setCauseDaoKey("identityMindResponseDAO");
            // Save status in ruleHistory.result
            ruler.putResult(status);
          } else {
            approvalRequest.setMemo("IdentityMind transaction check is skipped because it's not a bank-to-bank transaction.");
          }

          // Create approval request
          approvalRequest.setStatus(getApprovalStatus(status));
          approvalRequest.setApprover(getApprover(status));
          requestApproval(x, approvalRequest);
        }
      }, "Compliance Transaction Validator");
      `
    }
  ]
});
