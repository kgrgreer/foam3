foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'EstimateTransactionCompletionDate',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Estimates transaction completionDate according to clearing time.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Date',
    'net.nanopay.meter.clearing.ClearingTimeService',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO dao = (DAO) x.get("localTransactionDAO");
            Transaction transaction = (Transaction) obj.fclone();
            ClearingTimeService clearingTimeService = (ClearingTimeService) x.get("clearingTimeService");

            Date completionDate = clearingTimeService.estimateCompletionDateSimple(x, transaction);
            transaction.setCompletionDate(completionDate);
            dao.put(transaction);
          }
        }, "Estimate Transaction Completion Date");
      `
    }
  ]
});
