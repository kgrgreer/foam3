foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance after associated approval request changes.

    When approval request changes, the user object is re-put back into DAO
    without modification then here we check if there is no pending approval
    requests for the user on other causes (Eg., Securefact/DJ/IDM failed).

    If no more pending approval request, the user compliance is updated
    according the approval request status. Otherwise, passing on without
    changing user compliance.`,


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

        ArraySink sink = (ArraySink) dao
          .where(IN(ApprovalRequest.STATUS, new ApprovalStatus[] {
            ApprovalStatus.APPROVED, ApprovalStatus.REJECTED }))
          .orderBy(DESC(ApprovalRequest.LAST_MODIFIED))
          .limit(1)
          .select(new ArraySink());

        // Get approve request that was updated
        ApprovalRequest approvalRequest = null;
        if ( ! sink.getArray().isEmpty() ) {
          approvalRequest = (ApprovalRequest) sink.getArray().get(0);
        }

        // Get pending approval requests count
        Count requested = (Count) dao
          .where(AND(
            EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED),
            getCauseDaoKeyNEQ(approvalRequest),
            getCreatedGTE(approvalRequest)))
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
      name: 'getCreatedGTE',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'approvalRequest',
          type: 'net.nanopay.approval.ApprovalRequest'
        }
      ],
      javaCode: `
        return approvalRequest != null
          ? GTE(ApprovalRequest.CREATED, approvalRequest.getLastModified())
          : TRUE;
      `
    },
    {
      name: 'getCauseDaoKeyNEQ',
      type: 'foam.mlang.predicate.Predicate',
      args: [
        {
          name: 'approvalRequest',
          type: 'net.nanopay.approval.ApprovalRequest'
        }
      ],
      javaCode: `
        return approvalRequest instanceof ComplianceApprovalRequest
          ? NEQ(
              ComplianceApprovalRequest.CAUSE_DAO_KEY,
              ((ComplianceApprovalRequest) approvalRequest).getCauseDaoKey()
            )
          : TRUE;
      `
    }
  ]
});
