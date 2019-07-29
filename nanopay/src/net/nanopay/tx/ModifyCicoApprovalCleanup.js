foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoApprovalCleanup',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Cleans up any approval requests generated from the ModifyCicoStatusApproval rule',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
    'net.nanopay.tx.cico.CITransaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction ci = (CITransaction) obj;
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ((DAO) x.get("approvalRequestDAO"))
            .where(AND(
              EQ(ComplianceApprovalRequest.OBJ_ID, ci.getId()),
              EQ(ComplianceApprovalRequest.DAO_KEY, "localTransactionDAO"),
              EQ(ComplianceApprovalRequest.STATUS, ApprovalStatus.REQUESTED)))
            .removeAll();
          }
        }, "Prune Cico Approval Requests");
      `
    }
  ]
});
