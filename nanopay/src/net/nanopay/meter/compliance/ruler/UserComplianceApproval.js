foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance after approval request changes.

    When approval request changes (to APPROVED/REJECTED), the associated user
    object is re-put back into DAO without modification.

    UserComplianceApproval gets the updated approval request and clear the
    existing pending approval requests.

    If approval request is APPROVED, it will remove other pending approval
    requests of the same cause. For example, three approval requests were
    created because Securefact could not verify the user, if one approval
    request is updated to APPROVED then the other two approval requests will be
    removed. Then, if there is no more pending it updates the user compliance to
    PASSED. If there remain pending approval requests, it passes on without
    changing the user compliance.

    If approval request is REJECTED, it will remove all pending approval requests
    including approval requests of other causes (eg., IdentityMind
    REJECTED/MANUAL_REVIEW). Then it updates the user compliance to FAILED.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        User user = (User) obj.fclone();
        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "localUserDAO"),
            EQ(ApprovalRequest.OBJ_ID, Long.toString(user.getId()))
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
                getCauseEq((ComplianceApprovalRequest) approvalRequest)),
              LT(ApprovalRequest.CREATED, approvalRequest.getLastModified())))
            .removeAll();

          // Get pending approval requests count
          Count requested = (Count) dao
            .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
            .limit(1)
            .select(new Count());

          if ( requested.getValue() == 0 ) {
            DAO localUserDAO = (DAO) x.get("localUserDAO");
            user.setCompliance(
              ApprovalStatus.APPROVED == approvalRequest.getStatus()
                ? ComplianceStatus.PASSED
                : ComplianceStatus.FAILED);
            localUserDAO.inX(x).put(user);
          }
        }
      `
    },
    {
      name: 'getCauseEq',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'approvalRequest',
          type: 'net.nanopay.meter.compliance.ComplianceApprovalRequest'
        }
      ],
      javaCode: `
        return approvalRequest != null
          ? AND(
              EQ(ComplianceApprovalRequest.CAUSE_ID, approvalRequest.getCauseId()),
              EQ(ComplianceApprovalRequest.CAUSE_DAO_KEY, approvalRequest.getCauseDaoKey()))
          : TRUE;
      `
    }
  ]
});
