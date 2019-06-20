foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'ComplianceTransactionValidator',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Validates transaction via IdentityMind Transfer API.',

  javaImports: [
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.meter.compliance.ComplianceValidationStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.bank.BankAccount',
    'foam.util.SafetyUtil',
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
        Transaction transaction = (Transaction) obj;
        ComplianceValidationStatus status = ComplianceValidationStatus.PENDING;
        ComplianceApprovalRequest approvalRequest =
          new ComplianceApprovalRequest.Builder(x)
            .setObjId(transaction.getId())
            .setDaoKey("localTransactionDAO")
            .build();

        IdentityMindService identityMindService = (IdentityMindService) x.get("identityMindService");

        while ( ! SafetyUtil.isEmpty(transaction.getParent()) ) {
          Transaction parent = transaction.findParent(x);
          if ( parent != null ) {
            transaction = parent;
          } else {
            break;
          }
        }

        if ( transaction.findSourceAccount(x) instanceof BankAccount ) {
          try {
            IdentityMindResponse response = identityMindService.evaluateTransfer(x, transaction);
            status = response.getComplianceValidationStatus();
            TransactionStatus transactionStatus = getTransactionStatus(status);
            if ( transactionStatus != null ) {
              transaction.setInitialStatus(transactionStatus);
            }

            approvalRequest.setCauseId(response.getId());
            approvalRequest.setCauseDaoKey("identityMindResponseDAO");
            approvalRequest.setStatus(getApprovalStatus(status));
            approvalRequest.setApprover(getApprover(status));
          } finally {
            requestApproval(x, approvalRequest);
            ruler.putResult(status);
          }
        }
      `
    },
    {
      name: 'getTransactionStatus',
      type: 'net.nanopay.tx.model.TransactionStatus',
      args: [
        {
          name: 'status',
          type: 'net.nanopay.meter.compliance.ComplianceValidationStatus'
        }
      ],
      javaCode: `
        if ( ComplianceValidationStatus.VALIDATED == status ) {
          return TransactionStatus.COMPLETED;
        } else if ( ComplianceValidationStatus.REJECTED == status ) {
          return TransactionStatus.DECLINED;
        }
        return null;
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
