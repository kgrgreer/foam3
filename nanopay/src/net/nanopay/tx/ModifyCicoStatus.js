foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoStatus',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'Updates Cico status for transaction if status is pending and approval request is approved.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.model.TransactionStatus',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        CITransaction ci = (CITransaction) obj;
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        ApprovalRequest approvalRequest = (ApprovalRequest) approvalRequestDAO.find(
          AND(
            EQ(ApprovalRequest.OBJ_ID, ci.getId()),
            EQ(ApprovalRequest.DAO_KEY, "localTransactionDAO")
          )
        );
        if ( ci.getStatus() == TransactionStatus.SENT && approvalRequest.getStatus() == ApprovalStatus.APPROVED ) {
          ci.setStatus(TransactionStatus.COMPLETED);
        }
      `
    }
  ]
});
