foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance according to approval.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj.fclone();
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "localUserDAO"),
                EQ(ApprovalRequest.OBJ_ID, Long.toString(user.getId()))
              ));

            ApprovalStatus approval = ApprovalRequestUtil.getState(dao);
            if ( approval != ApprovalStatus.REQUESTED ) {
              user.setCompliance(ApprovalStatus.REJECTED == approval
                ? ComplianceStatus.FAILED
                // Approval can be null because no approval request is created
                // for the user e.g., when the user doesn't need further
                // approval. Hence, for a null or APPROVED approval, the user
                // compliance status is set to PASSED.
                : ComplianceStatus.PASSED);
              ((DAO) x.get("localUserDAO")).put(user);
            }
          }
        }, "User Compliance Approval");
      `
    }
  ]
});
