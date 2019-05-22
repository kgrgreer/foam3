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
    'net.nanopay.tx.model.TransactionStatus'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: ` 
      KotakFxTransaction kotakFxTransaction = (KotakFxTransaction) obj;
      // no fx rate has been entered
      DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
      Sink sink = new ArraySink();
      sink = approvalRequestDAO
        .where(
          MLang.AND(
            MLang.INSTANCE_OF(ManualFxApprovalRequest.class),
            MLang.EQ(ManualFxApprovalRequest.DAO_KEY, "transactionDAO"),
            MLang.EQ(ManualFxApprovalRequest.OBJ_ID, kotakFxTransaction.getId()),
            MLang.EQ(ManualFxApprovalRequest.STATUS, 1)
          )
        )
        .select(sink);
      List list = ((ArraySink) sink).getArray();
      if ( list != null && list.size() > 0 ) {
        // approval request with rate exists
        ManualFxApprovalRequest request = (ManualFxApprovalRequest) list.get(0);
        kotakFxTransaction.setFxRate(request.getRate());
        kotakFxTransaction.setStatus(TransactionStatus.COMPLETED);
        approvalRequestDAO.remove_(x, request);
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
