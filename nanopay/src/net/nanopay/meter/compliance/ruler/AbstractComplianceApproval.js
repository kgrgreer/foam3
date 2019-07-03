foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'AbstractComplianceApproval',
  abstract: true,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates object according to approval.

    AbstractComplianceApproval gets the last updated (ACCEPTED/REJECTED)
    approval request. Then, update the object by calling updateObj() method
    when there is no more pending approval requests.

    updateObj(x, obj, approvalStatus) method is supposed to be overridden by its
    sub-class.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'objDaoKey'
    },
    {
      class: 'String',
      name: 'description'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( SafetyUtil.isEmpty(getObjDaoKey()) ) {
          return;
        }

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO dao = ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
                EQ(ApprovalRequest.OBJ_ID, String.valueOf(obj.getProperty("id")))
              ));

            // Get approval request that was updated
            ArraySink sink = (ArraySink) dao
              .where(IN(ApprovalRequest.STATUS, new ApprovalStatus[]{
                ApprovalStatus.APPROVED, ApprovalStatus.REJECTED}))
              .orderBy(DESC(ApprovalRequest.LAST_MODIFIED))
              .limit(1)
              .select(new ArraySink());

            if ( ! sink.getArray().isEmpty() ) {
              ApprovalRequest approvalRequest = (ApprovalRequest) sink.getArray().get(0);

              // Get pending approval requests count
              Count requested = (Count) dao
                .where(EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED))
                .limit(1)
                .select(new Count());

              if ( requested.getValue() == 0 ) {
                updateObj(x, obj, approvalRequest.getStatus());
              }
            }
          }
        }, getDescription());
      `
    },
    {
      name: 'updateObj',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'FObject' },
        { name: 'approvalStatus', type: 'net.nanopay.approval.ApprovalStatus' }
      ],
      javaCode: '// Override updateObj in sub-class'
    }
  ]
});
