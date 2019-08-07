foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ModifyCicoRequestStatus',

  documentation: 'Updates Cico status for transaction if request is approved. Rule for request.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
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
        ExpediteCICOApprovalRequest req = (ExpediteCICOApprovalRequest) obj;
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        CITransaction ci = (CITransaction) transactionDAO.find(req.getObjId());
        if (req.getStatus() == ApprovalStatus.APPROVED && ci.getStatus() == TransactionStatus.SENT ) {
          ci.setStatus(TransactionStatus.COMPLETED);
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              transactionDAO.put(ci);
            }
          }, "Update CI Transaction After Status Change");
        }
      `
    }
  ]
});
