foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'UserComplianceApproval',
  extends: 'net.nanopay.meter.compliance.ruler.AbstractComplianceApproval',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Updates user compliance according to approval.',

  javaImports: [
<<<<<<< HEAD
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
=======
>>>>>>> c45bac687c2a346d813a54f527f58718a90d0314
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  properties: [
    {
<<<<<<< HEAD
      name: 'applyAction',
      javaCode: `
        agent.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
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
          }
        });

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
=======
      name: 'objDaoKey',
      value: 'localUserDAO'
    }
  ],

  methods: [
    {
      name: 'updateObj',
>>>>>>> c45bac687c2a346d813a54f527f58718a90d0314
      javaCode: `
        User user = (User) obj;
        user.setCompliance(
          ApprovalStatus.APPROVED == approvalStatus
            ? ComplianceStatus.PASSED
            : ComplianceStatus.FAILED);
        ((DAO) x.get(getObjDaoKey())).inX(x).put(user);
      `
    }
  ]
});
