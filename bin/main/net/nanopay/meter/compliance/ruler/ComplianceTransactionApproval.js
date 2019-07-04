foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',

  documentation: 'Updates compliance transaction according to approval.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
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
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          Transaction transaction = (Transaction) obj;
          if ( transaction.getStatus() == TransactionStatus.PENDING ) {
            transaction.setStatus(
              ApprovalStatus.APPROVED == approvalStatus
                ? TransactionStatus.COMPLETED
                : TransactionStatus.DECLINED);
          } else {
            transaction.setInitialStatus(
              ApprovalStatus.APPROVED == approvalStatus
                ? TransactionStatus.COMPLETED
                : TransactionStatus.DECLINED);
          }
        }}, 
        "Update transaction status");
      `
    }
  ]
});
