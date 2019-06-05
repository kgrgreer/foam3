foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'PruneApprovalRequests',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Remove pending approval requests.',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
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
        ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
            EQ(ApprovalRequest.OBJ_ID, obj.getProperty("id")),
            EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
          .removeAll();
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
    }
  ]
});
