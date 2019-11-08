foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'ComplianceTransactionPlanner',

  documentation: 'Plans compliance transaction before the transaction that actually transfers money/value to another user.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        for ( Transaction plan : quote.getPlans() ) {
          if ( plan instanceof SummaryTransaction
            || plan instanceof FXSummaryTransaction
            || plan instanceof VerificationTransaction
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
      `
    }
  ]
});
