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
      javaCode: `// NOTE: for requests such as RetailTransaction, it is
      // the responsibility of, perhaps a RetailTransactionDAO, to
      // initiate a Quote request.

      TransactionQuote quote = (TransactionQuote) obj;

      //when a planner forces to pick certain plan we do not calculate cost.
      if ( quote.getPlan() != null ) {
        return quote;
      }
      quote = (TransactionQuote) getDelegate().put_(x, quote);

      //when a planner forces to pick certain plan we do not calculate cost.
      if (quote.getPlan() != null) {
        return quote;
      }

      //if no plans found throw exception
      if ( quote.getPlans().length == 0 ) {
        Transaction requestTxn = quote.getRequestTransaction();
        String message = String.format("Unable to find a plan for transaction with source currency: %s, destination currency: %s, source account: %d, destination account: %d", requestTxn.getSourceCurrency(), requestTxn.getDestinationCurrency(), requestTxn.getSourceAccount(), requestTxn.getDestinationAccount());
        sendNOC(x, message);
        ((Logger) x.get("logger")).error(message);
        throw new UnsupportedTransactionException("Unable to find a plan for requested transaction.");
      }

      //if there was only one plan added we do not need to calculate the cost.
      if ( quote.getPlans().length == 1 ) {
        quote.setPlan(quote.getPlans()[0]);
        return quote;
      }
      // Select the best plan.
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
      Transaction plan = transactionPlans.get(0);
      quote.setPlan(plan);
      // TransactionQuotes - return all plans.
      return quote;`
    },
    {
      name: 'sendNOC',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'message',
          type: 'String'
        }
      ],
      javaCode: `
      Notification notification = new Notification.Builder(x)
        .setTemplate("NOC")
        .setBody(message)
        .build();
    ((DAO) x.get("localNotificationDAO")).put(notification);
    ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), message);
    `
    },
  ]
});
