foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ComplianceTransactionApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Updates compliance transaction according to approval.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        ComplianceTransaction transaction = (ComplianceTransaction) obj;
        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
            EQ(ApprovalRequest.OBJ_ID, transaction.getId())
          ));

        // Get approval request that was updated
        ArraySink sink = (ArraySink) dao
          .where(IN(ApprovalRequest.STATUS, new ApprovalStatus[] {
            ApprovalStatus.APPROVED, ApprovalStatus.REJECTED }))
          .orderBy(DESC(ApprovalRequest.LAST_MODIFIED))
          .limit(1)
          .select(new ArraySink());

        if ( ! sink.getArray().isEmpty() ) {
          ApprovalRequest approvalRequest = (ApprovalRequest) sink.getArray().get(0);

          // Remove existing pending approval requests
          dao
            .where(AND(
              EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
              OR(
                EQ(approvalRequest.getStatus(), ApprovalStatus.REJECTED),
                getCauseEq(approvalRequest)),
              LT(ApprovalRequest.CREATED, approvalRequest.getLastModified())))
            .removeAll();

          // Get pending approval requests count
          Count requested = (Count) dao
            .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
            .limit(1)
            .select(new Count());

          if ( requested.getValue() == 0
            && TransactionStatus.PENDING == transaction.getStatus()
          ) {
            transaction.setStatus(
              ApprovalStatus.APPROVED == approvalRequest.getStatus()
                ? TransactionStatus.COMPLETED
                : TransactionStatus.DECLINED);
          }
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: '//noop'
    },
    {
      name: 'canExecute',
      javaCode: 'return true;'
    },
    {
      name: 'describe',
      javaCode: 'return "";'
    },
    {
      name: 'getCauseEq',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'approvalRequest',
          type: 'net.nanopay.approval.ApprovalRequest'
        }
      ],
      javaCode: `
        if ( approvalRequest instanceof ComplianceApprovalRequest ) {
          ComplianceApprovalRequest ar = (ComplianceApprovalRequest) approvalRequest;
          return AND(
            EQ(ComplianceApprovalRequest.CAUSE_ID, ar.getCauseId()),
            EQ(ComplianceApprovalRequest.CAUSE_DAO_KEY, ar.getCauseDaoKey())
          );
        }
        return TRUE;
      `
    }
  ]
});
