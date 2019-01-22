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
    'foam.nanos.notification.Notification',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.exception.UnsupportedTransactionException',
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
        // if no plan, then unsupported Transaction
        Transaction requestTxn = quote.getRequestTransaction();
        String message = String.format("Unable to find a plan for transaction with source currency: %s, destination currency: %s, source account: %d, destination account: %d", requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), requestTxn.getSourceAccount(), requestTxn.getDestinationAccount());
        sendNOC(x, message);
        throw new UnsupportedTransactionException(message);
      }
      logger.debug(this.getClass().getSimpleName(), "put", "setting selected plan.");
      quote.setPlan(plan);
    }
    // TransactionQuotes - return all plans.
    logger.debug(this.getClass().getSimpleName(), "put", "return quote.");

    return quote;
`
    },
    {
      name: 'sendNOC',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'message',
          javaType: 'String'
        }
      ],
      javaCode: `
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
    ((DAO) x.get("notificationDAO")).put(notification);
    ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
    `
    },
  ]
});
