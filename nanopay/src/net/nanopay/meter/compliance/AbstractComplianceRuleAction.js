foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'AbstractComplianceRuleAction',
  abstract: true,

  documentation: 'Abstract rule action for compliance validator.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'String',
      name: 'approverGroupId',
      value: 'fraud-ops'
    }
  ],

  methods: [
    {
      name: 'requestApproval',
      type: 'Void',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'approvalRequest',
          type: 'net.nanopay.approval.ApprovalRequest'
        }
      ],
      javaCode: `
        // When approval request already contains approver, create
        // the approval request only.
        if ( approvalRequest.getApprover() != 0 ) {
          ((DAO) x.get("approvalRequestDAO")).put(approvalRequest);
          return;
        }

        // When the approval request does not have approver, create
        // approval requests for each user in the approver group.
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = (Group) groupDAO.find(getApproverGroupId());
        if ( group != null ) {
          DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
          DAO localUserDAO = (DAO) x.get("localUserDAO");

          ApprovalRequest ar = (ApprovalRequest) approvalRequest.fclone();
          
          ar.setGroup(group.getId());
          approvalRequestDAO.put(ar);

        }
      `
    }
  ]
});
 