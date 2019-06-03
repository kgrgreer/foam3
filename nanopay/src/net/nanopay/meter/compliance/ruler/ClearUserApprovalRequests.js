foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'ClearUserApprovalRequests',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Clears pending approval requests for a user.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        
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
      `
    }
  ]
});
