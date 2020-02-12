foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CreateManualFxRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when a kotakFxTransaction is created.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.fx.ManualFxApprovalRequest'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) obj;
            DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
            approvalRequestDAO.put_(x,
              new ManualFxApprovalRequest.Builder(x)
                .setClassification("Kotak Manual FX Transaction Completion")
                .setDescription("Kotak Manul FX transfer is comlpeted")
                .setDaoKey("transactionDAO")
                .setObjId(kotakFxTransaction.getId())
                .setGroup("payment-ops")
                .setStatus(ApprovalStatus.REQUESTED).build());
          }
        }, "Create Manual FX Rule");
      `
    }
  ]
 });
