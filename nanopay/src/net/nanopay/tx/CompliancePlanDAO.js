foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompliancePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Adds a compliance transaction right after SummaryTransaction Plan.',

  javaImports: [
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
        Transaction [] plans = quote.getPlans();
        for ( Transaction plan : plans ) {
        // should this be instanceof AbliiTransaction? Does SummaryTransaction necessarily have COTxn in it?
          if ( plan instanceof SummaryTransaction || plan instanceof FXSummaryTransaction) {
            ComplianceTransaction ct = new ComplianceTransaction.Builder(x).build();
            ct.copyFrom(plan);
            ct.setIsQuoted(true);
            ct.setNext(plan.getNext());
            Transaction [] ctArray = new Transaction [1];
            ctArray[0] = ct;
            plan.setNext(ctArray);
          }
        }
        return quote;
      `
    }
  ]
});
