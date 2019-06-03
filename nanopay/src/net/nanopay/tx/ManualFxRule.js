foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ManualFxRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Get FX rate if an approval request with FX quote is available.`,

   javaImports: [
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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
      ManualFxApprovalRequest request = (ManualFxApprovalRequest) obj;
      DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
      DAO transactionDAO = ((DAO) x.get("transactionDAO"));
      Sink sink = new ArraySink();
      sink = transactionDAO
        .where(
          MLang.AND(
            MLang.INSTANCE_OF(KotakFxTransaction.class),
            MLang.EQ(Transaction.ID, request.getObjId())
          )
        )
        .select(sink);
      List list = ((ArraySink) sink).getArray();
      if ( list != null && list.size() > 0 ) {
        // approval request with rate exists
        KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) list.get(0);
        double rate = request.getRate();
        if ( rate <= 0 ) {
          request.setStatus(ApprovalStatus.REQUESTED);
          request = (ManualFxApprovalRequest) approvalRequestDAO.put_(x, request);
        } else {
          kotakFxTransaction.setFxRate(request.getRate());
          kotakFxTransaction.setStatus(TransactionStatus.COMPLETED);
          transactionDAO.put_(x, kotakFxTransaction);
          approvalRequestDAO
            .where(
              MLang.AND(
                MLang.INSTANCE_OF(ManualFxApprovalRequest.class),
                MLang.EQ(ManualFxApprovalRequest.DAO_KEY, "transactionDAO"),
                MLang.EQ(ManualFxApprovalRequest.OBJ_ID, kotakFxTransaction.getId()),
                MLang.NEQ(ManualFxApprovalRequest.ID, request.getId())
              )
            )
            .removeAll();
        }
      }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` 
      `
    },
    {
      name: 'describe',
      javaCode: ` return "Get FX rate if an approval request with FX quote is available."; `
    },
    {
      name: 'canExecute',
      javaCode: ` return true;`
    }
  ]
 });
