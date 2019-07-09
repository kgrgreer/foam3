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
    'foam.util.SafetyUtil',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
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
        ComplianceTransaction ct = (ComplianceTransaction) obj;
        Transaction headTx = ct;
        while ( ! SafetyUtil.isEmpty(headTx.getParent()) ) {
          headTx = headTx.findParent(x);
        }
        ComplianceApprovalRequest req = new ComplianceApprovalRequest.Builder(x)
          .setDaoKey("localTransactionDAO")
          .setObjId(ct.getId())
          .setApprover(getJackieId())
          .setGroup("fraud-ops")
          .setDescription("Main Summary txn: "+headTx.getSummary()+" The Id of Summary txn: "+headTx.getId() )
          .setClassification("Validate Transaction Using Jackie Rule")
          .build();

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            requestApproval(x, req);
          }
        });
      `
    }
  ]
});
