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
    'net.nanopay.meter.compliance.ComplianceApprovalRequest',
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

        ComplianceApprovalRequest approvalRequest = (ComplianceApprovalRequest) approvalRequestDAO.find(
          AND(
            EQ(ComplianceApprovalRequest.OBJ_ID, ci.getId()),
            EQ(ComplianceApprovalRequest.DAO_KEY, "localTransactionDAO")
          )
        );

        if ( ci.getStatus() == TransactionStatus.SENT && approvalRequest.getStatus() == ApprovalStatus.APPROVED ) {
          ci.setStatus(TransactionStatus.COMPLETED);
        }
      `
    }
  ]
});
