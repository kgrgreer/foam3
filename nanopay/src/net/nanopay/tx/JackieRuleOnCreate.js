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
    'foam.nanos.app.AppConfig',
    'foam.nanos.app.Mode',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.TransactionStatus',
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
        ComplianceTransaction ct = (ComplianceTransaction) obj;
        Count count = (Count) ((DAO) x.get("approvalRequestDAO"))
          .where(AND(
            EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO"),
            EQ(ApprovalRequest.OBJ_ID, ct.getId()),
            EQ(ApprovalRequest.APPROVER, getJackieId())))
          .limit(1)
          .select(new Count());

        ApprovalRequest req = new ApprovalRequest.Builder(x)
          .setDaoKey("localTransactionDAO")
          .setObjId(ct.getId())
          .setApprover(getJackieId())
          .build();

        agent.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            requestApproval(x, req);
          }
        });
      `
    }
  ]
});
