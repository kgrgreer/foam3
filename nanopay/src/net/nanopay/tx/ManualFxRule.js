foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ManualFxRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request if a manual transaction fx rate has been entered.`,

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
    'net.nanopay.tx.model.TransactionStatus'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
      KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) obj;
      if ( kotakFxTransaction.getRate() == 0 ) {
        // no fx rate has been entered
        DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
        Sink sink = new ArraySink();
        sink = approvalRequestDAO
          .where(
            MLang.AND(
              MLang.AND(
                MLang.EQ(ManualFxApprovalRequest.DAO_KEY, "transactionDAO"),
                MLang.EQ(ManualFxApprovalRequest.OBJ_ID, kotakFxTransaction.getId())
              ),
              MLang.EQ(ManualFxApprovalRequest.STATUS, 1)
            ) 
          )
          .select(sink);
        List list = ((ArraySink) sink).getArray();
         if ( list != null && list.size() > 0 ) {
          // approval request with rate exists
          ManualFxApprovalRequest request = (ManualFxApprovalRequest) list.get(0);
          kotakFxTransaction.setRate(request.getRate());
          kotakFxTransaction.setStatus(TransactionStatus.COMPLETED);
          approvalRequestDAO.remove_(x, request);
        } else {
          approvalRequestDAO.put_(x,
            new ManualFxApprovalRequest.Builder(x)
              .setDaoKey("transactionDAO")
              .setObjId(kotakFxTransaction.getId())
              .setApprover(1348)
              .setStatus(ApprovalStatus.REQUESTED).build());
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
      javaCode: ` return "Creates an approval request if a manual transaction fx rate has been entered."; `
    },
    {
      name: 'canExecute',
      javaCode: ` return true;`
    }
  ]
 });
