/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuoteDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Request a plan quote for a Transaction.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.TransactionQuotes',
    'net.nanopay.tx.model.Transaction',

    'net.nanopay.tx.PlanCostComparator',
    'net.nanopay.tx.PlanETAComparator',
    'net.nanopay.tx.PlanTransactionComparator',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Collections'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    // NOTE: for requests such as RetailTransaction, it is
    // the responsibility of, perhaps a RetailTransactionDAO, to
    // initiate a Quote request.

    Logger logger = (Logger) x.get("logger");
    TransactionQuote quote = (TransactionQuote) obj;
   
    logger.debug(this.getClass().getSimpleName(), "put", quote);

    if ( quote.getPlan() != null ) {
      logger.debug(this.getClass().getSimpleName(), "put", "already has plan.");
      return quote;
    }

    // Select the best plan.
    quote = (TransactionQuote) getDelegate().put_(x, quote);
    if ( quote instanceof TransactionQuote &&
         ! ( quote instanceof TransactionQuotes ) ) {
      PlanCostComparator costComparator =  new PlanCostComparator.Builder(x).build();
      PlanETAComparator etaComparator =  new PlanETAComparator.Builder(x).build();
      PlanTransactionComparator planComparators = new PlanTransactionComparator.Builder(x).build();
      planComparators.add(costComparator); // Compare Cost first
      planComparators.add(etaComparator);
      List<Transaction> transactionPlans = new ArrayList<Transaction>();
      for ( Object aTransaction : quote.getPlans() ) {
        transactionPlans.add((Transaction) aTransaction);
      }
      Collections.sort(transactionPlans, planComparators);
      Transaction plan = null;
      if ( ! transactionPlans.isEmpty() ) {
        plan = transactionPlans.get(0);
      } else {
        // if no plan, then set to empty plan.
        //plan = new Transaction.Builder(x).build();
      }
      logger.debug(this.getClass().getSimpleName(), "put", "setting selected plan.");
      quote.setPlan(plan);
    }
    // TransactionQuotes - return all plans.
    logger.debug(this.getClass().getSimpleName(), "put", "return quote.");

    return quote;
`
    }
  ]
});
