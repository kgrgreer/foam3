/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',

    'net.nanopay.tx.exception.UnsupportedTransactionException',
    'net.nanopay.tx.TransactionQuotes',
    'net.nanopay.tx.model.Transaction',

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
      Logger logger = (Logger) x.get("logger");

      //when a planner forces to pick certain plan we do not calculate cost.
      if ( quote.getPlan() != null ) {
        // only add plan if it is valid
        try {
          validateTransactionChain(x, quote.getPlan());
        } catch (Exception e ) {
          logger.warning("Transaction plan failed to validate", e, quote.getPlan());
          throw new UnsupportedTransactionException("Unable to find a plan for requested transaction.", e);
        }
        return quote;
      }
      quote = (TransactionQuote) getDelegate().put_(x, quote);

      //when a planner forces to pick certain plan we do not calculate cost.
      if (quote.getPlan() != null) {
        // only add plan if it is valid
        try {
          validateTransactionChain(x, quote.getPlan());
        } catch (Exception e ) {
          logger.warning("Transaction plan failed to validate", e, quote.getPlan());
          throw new UnsupportedTransactionException("Unable to find a plan for requested transaction.", e);
        }
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
        // only add plan if it is valid
        try {
          validateTransactionChain(x, quote.getPlans()[0]);
        } catch (Exception e ) {
          logger.warning("Transaction plan failed to validate", e, quote.getPlans()[0]);
          throw new UnsupportedTransactionException("Unable to find a plan for requested transaction.", e);
        }
        quote.setPlan(quote.getPlans()[0]);
        return quote;
      }
      // Select the best plan.
      PlanCostComparator costComparator =  new PlanCostComparator.Builder(x).build();
      PlanETAComparator etaComparator =  new PlanETAComparator.Builder(x).build();
      PlanTransactionComparator planComparators = new PlanTransactionComparator.Builder(x).build();
      planComparators.add(costComparator); // Compare Cost first
      planComparators.add(etaComparator);
      List<Transaction> transactionPlans = new ArrayList<>();
      Exception cause = null;

      for ( Transaction aTransaction : quote.getPlans() ) {
        try {
          validateTransactionChain(x, aTransaction);
          transactionPlans.add(aTransaction);
        } catch (Exception e) {
          logger.warning("Transaction plan failed to validate", e, aTransaction);
          cause = e;
        }
      }
      if ( transactionPlans.size() == 0 ) {
        throw new UnsupportedTransactionException("Unable to find a plan for requested transaction.", cause);
      }
      Collections.sort(transactionPlans, planComparators);
      quote.setPlan(transactionPlans.get(0));
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
    {
      name: 'validateTransactionChain',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
      ],
      javaCode: `
        transaction.validate(x);
        if (transaction.getNext()!= null && transaction.getNext().length != 0) {
          for ( Transaction txn : transaction.getNext() ) {
            validateTransactionChain(x, txn);
          }
        }
      `
    }
  ]
});
