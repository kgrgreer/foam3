foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'AbstractComplianceApproval',
  abstract: true,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates new object according to approval.
  
    When approval request changes (to APPROVED/REJECTED), the associated
    object is re-put back into DAO without modification.

    AbstractComplianceApproval gets the last updated approval request and clear
    the existing pending approval requests.

    If approval request is APPROVED, it will remove other pending approval
    requests of the same cause. For example, three approval requests were
    created because Securefact could not verify a user, if one approval
    request is updated to APPROVED then the other two approval requests will be
    removed.

    If approval request is REJECTED, it will remove all pending approval
    requests including approval requests of other causes (eg., IdentityMind
    MANUAL_REVIEW).
    
    Then, if there is no more pending approval requests for the object it calls
    updateObj(x, obj, approvalStatus) method which can be overridden by its
    sub-class.`,

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'objDaoKey'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( SafetyUtil.isEmpty(getObjDaoKey()) ) {
          return;
        }

        DAO dao = ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
            EQ(ApprovalRequest.OBJ_ID, String.valueOf(obj.getProperty("id")))
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

          if ( requested.getValue() == 0 ) {
            updateObj(x, obj, approvalRequest.getStatus());
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
    },
    {
      name: 'updateObj',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'approvalStatus',
          type: 'net.nanopay.approval.ApprovalStatus'
        }
      ],
      javaCode: '// Override updateObj in sub-class'
    }
  ]
});
