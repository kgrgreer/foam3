foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',

  documentation: 'Updates compliance transaction according to approval.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'objDaoKey',
      value: 'localTransactionDAO'
    }
  ],

  methods: [
    {
      name: 'updateObj',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        transaction.setInitialStatus(
          ApprovalStatus.APPROVED == approvalStatus
            ? TransactionStatus.COMPLETED
            : TransactionStatus.DECLINED);
      `
    }
  ]
});
