foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',

  documentation: 'Updates compliance transaction according to approval.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'objDaoKey',
      value: 'localTransactionDAO'
    },
    {
      name: 'description',
      value: 'Update compliance transaction status'
    }
  ],

  methods: [
    {
      name: 'updateObj',
      javaCode: `
        Transaction transaction = (Transaction) obj;
        if ( transaction.getStatus() == TransactionStatus.PENDING ) {
          transaction.setStatus(
            ApprovalStatus.APPROVED == approvalStatus
              ? TransactionStatus.COMPLETED
              : TransactionStatus.DECLINED);
          ((DAO) x.get(getObjDaoKey())).inX(x).put(transaction);
        }
      `
    }
  ]
});
