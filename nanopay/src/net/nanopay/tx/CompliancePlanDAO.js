foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompliancePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Adds a compliance transaction to all COTransaction Plans.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.OverdraftAccount',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.tx.model.Transaction',
    'foam.nanos.logger.Logger',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
        Transaction [] plans = quote.getPlans();
        ArrayList<Transaction> newPlans = new ArrayList();

        for ( Transaction plan : plans ) {
          if ( plan instanceof SummaryTransaction ) {
            ComplianceTransaction ct = new ComplianceTransaction.Builder(x)
              .setDestinationAccount(plan.getDestinationAccount())
              .setSourceAccount(plan.getSourceAccount())
              .setAmount(plan.getAmount())
              .setIsQuoted(true)
              .build();
            ct.setNext(plan.getNext());
            Transaction [] ctArray = new Transaction [1];
            ctArray[0] = ct;
            plan.setNext(ctArray);
          }
          newPlans.add(plan);
        }

         plans = newPlans.toArray(new Transaction[newPlans.size()]);
         quote.setPlans(plans);
        return quote;
      `
    }
  ]
});
