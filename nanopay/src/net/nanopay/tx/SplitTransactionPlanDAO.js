/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SplitTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.TransactionPlan',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'foam.dao.DAO'
  ],

  properties: [
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
      if ( ! (obj instanceof TransactionQuote) ) {
        return getDelegate().put_(x, obj);
      }

      Logger logger = (Logger) x.get("logger");

      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      TransactionPlan plan = new TransactionPlan.Builder(x).build();

      logger.debug(this.getClass().getSimpleName(), "put", quote);

      Account sourceAccount = request.findSourceAccount(x);
      Account destinationAccount = request.findDestinationAccount(x);

      if ( sourceAccount instanceof CABankAccount &&
        destinationAccount instanceof INBankAccount ) {

        // Cash In to Digital Account. Should be handled by AlternaTransactionPlanDAO
        TransactionQuote ciQuote = new TransactionQuote.Builder(x).build();
        ciQuote.copyFrom(quote);
        // Build a Cashin Request from initial request
        Transaction ciTransactionRequest = new Transaction.Builder(x).build();
        ciTransactionRequest.copyFrom(request);
        // Get Payer Digital Account to fufil CASH-IN
        DigitalAccount sourceDigitalaccount = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), null);
        ciTransactionRequest.setDestinationAccount(sourceDigitalaccount.getId());
        ciQuote.setRequestTransaction(ciTransactionRequest);
        TransactionQuote cashinQuote = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, ciQuote);

        // Cash Out to Payee Bank Account. Should be handled by KotakPlanDAO
        TransactionQuote coQuote = new TransactionQuote.Builder(x).build();
        coQuote.copyFrom(quote);
        // Build a Cashout request from initial request
        Transaction coTransactionRequest = new Transaction.Builder(x).build();
        coTransactionRequest.copyFrom(request);
        // CASH-OUT from Payer's Digital Account to Payee INR Bank account
        ciTransactionRequest.setSourceAccount(sourceDigitalaccount.getId());
        coTransactionRequest.setDestinationAccount(destinationAccount.getId());
        TransactionQuote cashoutQuote = (TransactionQuote) ((DAO) x.get("localTransactionQuotePlanDAO")).put_(x, coQuote);

        CompositeTransaction compositeTransaction =  new CompositeTransaction.Builder(x).build();
        compositeTransaction.add(x, (Transaction) cashinQuote.getPlan().getTransaction());
        compositeTransaction.add(x, (Transaction) cashoutQuote.getPlan().getTransaction());

        plan.setTransaction(compositeTransaction);

        if (plan.getTransaction() != null) {
          quote.addPlan(plan);
        }

      }

      return super.put_(x, quote);
    `
    },
  ]
});
