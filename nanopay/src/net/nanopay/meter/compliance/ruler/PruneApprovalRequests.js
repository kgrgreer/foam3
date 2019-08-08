foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'PruneApprovalRequests',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Remove pending approval requests.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User'
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
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ((DAO) x.get("approvalRequestDAO"))
            .where(AND(
              EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
              EQ(ApprovalRequest.OBJ_ID, String.valueOf(obj.getProperty("id"))),
              EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
            .removeAll();
          }
        }, "Prune Approval Requests");
      `
    }
  ]
});
