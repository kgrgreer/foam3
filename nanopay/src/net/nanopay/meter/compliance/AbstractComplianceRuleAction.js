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
    'net.nanopay.approval.ApprovalStatus'
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
          name: 'obj',
          type: 'FObject'
        },
        {
          name: 'objDaoKey',
          type: 'String'
        }
      ],
      javaCode: `
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = (Group) groupDAO.find(getApproverGroupId());
        if ( group != null ) {
          DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
          String objId = String.valueOf(obj.getProperty("id"));

          group.getUsers(x).select(new AbstractSink() {
            @Override
            public void put(Object o, Detachable d) {
              User approver = (User) o;
              approvalRequestDAO.put(
                new ApprovalRequest.Builder(x)
                  .setApprover(approver.getId())
                  .setObjId(objId)
                  .setDaoKey(objDaoKey)
                  .setStatus(ApprovalStatus.REQUESTED)
                  .build()
              );
            }
          });
        }
      `
    }
  ]
});
