foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompliancePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Adds a compliance transaction right after SummaryTransaction
    and FXSummaryTransaction.`,

  javaImports: [
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
        for ( Transaction plan : quote.getPlans() ) {
          if ( plan instanceof SummaryTransaction
            || plan instanceof FXSummaryTransaction
          ) {
            ComplianceTransaction ct = new ComplianceTransaction.Builder(x).build();
            ct.copyFrom(plan);
            ct.clearLineItems();
            ct.setIsQuoted(true);
            plan.setNext(new Transaction[] { ct });
          }
        }

        return quote;
      `
    }
  ]
});
