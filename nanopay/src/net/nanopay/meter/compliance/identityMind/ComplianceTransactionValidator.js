foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ComplianceTransactionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates transaction via IdentityMind Transfer API.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'identityMindUserId',
      class: 'Long',
      value: 1013
    }
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
              .build();

          IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");

          Transaction head = transaction;
          while ( ! SafetyUtil.isEmpty(head.getParent()) ) {
            Transaction parent = head.findParent(x);
            if ( parent == null ) break;
            head = parent;
          }

          if ( head.findSourceAccount(x) instanceof BankAccount ) {
            try {
              IdentityMindResponse response = identityMindService.evaluateTransfer(x, head);
              status = response.getComplianceValidationStatus();

              approvalRequest.setCauseId(response.getId());
              approvalRequest.setCauseDaoKey("identityMindResponseDAO");
              approvalRequest.setStatus(getApprovalStatus(status));
              approvalRequest.setApprover(getApprover(status));
            } finally {
              requestApproval(x, approvalRequest);
              ruler.putResult(status);
            }
          }
        }
      }, "Compliance Transaction Validator");
      `
    },
    {
      name: 'getApprovalStatus',
      type: 'net.nanopay.approval.ApprovalStatus',
      args: [
        {
          name: 'status',
          type: 'net.nanopay.meter.compliance.ComplianceValidationStatus'
        }
      ],
      javaCode: `
        if ( ComplianceValidationStatus.VALIDATED == status ) {
          return ApprovalStatus.APPROVED;
        } else if ( ComplianceValidationStatus.REJECTED == status ) {
          return ApprovalStatus.REJECTED;
        }
        return ApprovalStatus.REQUESTED;
      `
    },
    {
      name: 'getApprover',
      type: 'Long',
      args: [
        {
          name: 'status',
          type: 'net.nanopay.meter.compliance.ComplianceValidationStatus'
        }
      ],
      javaCode: `
        if ( ComplianceValidationStatus.VALIDATED == status
          || ComplianceValidationStatus.REJECTED == status
        ) {
          return getIdentityMindUserId();
        }
        return 0L;
      `
    }
  ]
});
