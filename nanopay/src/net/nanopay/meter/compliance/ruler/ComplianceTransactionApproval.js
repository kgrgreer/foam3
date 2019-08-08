foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',

  documentation: 'Updates compliance transaction according to approval.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Transaction transaction = (Transaction) obj.fclone();
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
                EQ(ApprovalRequest.OBJ_ID, transaction.getId())
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval != null && approval != ApprovalStatus.REQUESTED ) {
              transaction.setStatus(
                ApprovalStatus.APPROVED == approval
                  ? TransactionStatus.COMPLETED
                  : TransactionStatus.DECLINED);
              ((DAO) x.get("localTransactionDAO")).put(transaction);
            }
          }
        }, "Compliance Transaction Approval");
      `
    }
  ]
});
