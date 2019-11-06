foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompliancePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Adds a compliance transaction right before a transaction that
    actually transfers money to another user.`,

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
            || plan instanceof ComplianceTransaction
            || plan.findSourceAccount(x).getOwner() == plan.findDestinationAccount(x).getOwner()
          ) {
            continue;
          }

          ComplianceTransaction ct = new ComplianceTransaction.Builder(x).build();
          ct.copyFrom(plan);
          ct.clearLineItems();
          ct.setIsQuoted(true);
          ct.addNext(plan);
          quote.setPlan(ct);
        }

        return quote;
      `
    }
  ]
});
