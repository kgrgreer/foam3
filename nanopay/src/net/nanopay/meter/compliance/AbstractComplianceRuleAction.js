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
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = (Group) groupDAO.find(getApproverGroupId());
        if ( group != null ) {
          DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
          DAO localUserDAO = (DAO) x.get("localUserDAO");

          // Create an approval request for each user in the approver group
          localUserDAO.inX(x)
            .where(EQ(User.GROUP, group.getId()))
            .select(new AbstractSink() {
              @Override
              public void put(Object o, Detachable d) {
                User approver = (User) o;
                ApprovalRequest ar = (ApprovalRequest) approvalRequest.fclone();

                ar.setApprover(approver.getId());
                approvalRequestDAO.put(ar);
              }
            });
        }
      `
    }
  ]
});
