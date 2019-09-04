foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoStatus',

  documentation: 'Updates Cico status for transaction if status is sent. Rule for transaction.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.tx.ExpediteCICOApprovalRequest',
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
        ExpediteCICOApprovalRequest approvalRequest = (ExpediteCICOApprovalRequest) approvalRequestDAO.find(
          AND(
            EQ(ExpediteCICOApprovalRequest.OBJ_ID, ci.getId()),
            EQ(ExpediteCICOApprovalRequest.DAO_KEY, "localTransactionDAO")
          )
        );
        if ( approvalRequest != null
          && ci.getStatus() == TransactionStatus.SENT
          && approvalRequest.getStatus() == ApprovalStatus.APPROVED
        ) {
          ci.setStatus(TransactionStatus.COMPLETED);
        }
      `
    }
  ]
});
