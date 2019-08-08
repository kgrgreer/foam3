foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CreateManualFxRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when a kotakFxTransaction is created.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.*',
    'java.util.List',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.fx.FXService',
    'net.nanopay.fx.KotakFxTransaction',
    'net.nanopay.fx.ManualFxApprovalRequest',
    'net.nanopay.tx.model.TransactionStatus'
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
