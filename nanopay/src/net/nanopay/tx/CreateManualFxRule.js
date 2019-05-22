foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CreateManualFxRule',
  implements: ['foam.nanos.ruler.RuleAction'],

   documentation: `Creates an approval request when a kotakFxTransaction is created.`,

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
      DAO approvalRequestDAO = (DAO) x.get("approvalRequestDAO");
      approvalRequestDAO.put_(x,
        new ManualFxApprovalRequest.Builder(x)
          .setDaoKey("transactionDAO")
          .setObjId(kotakFxTransaction.getId())
          .setApprover(1348)
          .setStatus(ApprovalStatus.REQUESTED).build());
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` 
      `
    },
    {
      name: 'describe',
      javaCode: ` return "Creates an approval request when a kotakFxTransaction is created."; `
    },
    {
      name: 'canExecute',
      javaCode: ` return true;`
    }
  ]
 });
