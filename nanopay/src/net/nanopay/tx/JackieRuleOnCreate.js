foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'JackieRuleOnCreate',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: `Creates an approval request if a Compliance Transaction is encountered.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.util.SafetyUtil',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.Transaction',

  ],

  properties: [
    {
      name: 'jackieId',
      class: 'Long',
      value: 8233
      //class: 'Reference',
      //of: 'foam.nanos.auth.Group',
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `

        agent.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ComplianceTransaction ct = (ComplianceTransaction) obj;
            Transaction headTx = ct;
            Count count = (Count) ((DAO) x.get("approvalRequestDAO"))
              .where(AND(
                EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
                EQ(ApprovalRequest.OBJ_ID, ct.getId()),
                EQ(ApprovalRequest.APPROVER, getJackieId())))
              .limit(1)
              .select(new Count());

            if ( count.getValue() == 0 ) {
              while ( ! SafetyUtil.isEmpty(headTx.getParent())) {
                headTx = headTx.findParent(x);
              }
              ApprovalRequest req = new ApprovalRequest.Builder(x)
                .setDaoKey("localTransactionDAO")
                .setObjId(ct.getId())
                .setApprover(getJackieId())
                .setDescription("Main Summary txn: "+headTx.getSummary()+" The Id of Summary txn: "+headTx.getId()+ )
                .build();
              requestApproval(x, req);
            }
          }
        }, "Submits an Approval Request to the compliance team for this Compliance transaction");
      `
    }
  ]
});
