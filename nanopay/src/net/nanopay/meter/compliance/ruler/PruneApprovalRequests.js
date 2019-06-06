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
<<<<<<< HEAD:nanopay/src/net/nanopay/meter/compliance/ruler/ClearUserApprovalRequests.js
        
        agent.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "localUserDAO"),
                EQ(ApprovalRequest.OBJ_ID, Long.toString(user.getId())),
                EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
              .removeAll();
          }
        });
=======
        ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, getObjDaoKey()),
            EQ(ApprovalRequest.OBJ_ID, obj.getProperty("id")),
            EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
          .removeAll();
>>>>>>> c45bac687c2a346d813a54f527f58718a90d0314:nanopay/src/net/nanopay/meter/compliance/ruler/PruneApprovalRequests.js
      `
    }
  ]
});
