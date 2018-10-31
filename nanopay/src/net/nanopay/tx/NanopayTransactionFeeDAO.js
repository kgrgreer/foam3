/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NanopayTransactionFeeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',

    'net.nanopay.tx.model.TransactionFee',
    'net.nanopay.tx.FeeTransfer',
    'net.nanopay.tx.model.Transaction',

    'java.util.List'
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
      Logger logger = (Logger) x.get("logger");
      TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);

      for ( int i = 0; i < quote.getPlans().length; i++ ) {
        Transaction transaction = quote.getPlans()[i];
        if ( null != transaction ) {
          Transaction txn = (Transaction) transaction.fclone();
          quote.getPlans()[i] = applyFees(x, txn, txn);

          Transaction prev = txn.getPrev();
          while ( prev != null ) {
             applyFees(x, prev, txn);
             prev = prev.getPrev();
          }
          Transaction next = txn.getNext();
          while ( prev != null ) {
             applyFees(x, next, txn);
             prev = prev.getNext();
          }
        }
      }
      return quote;
`
    },
    {
      name: 'applyFees',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'transaction',
          of: 'net.nanopay.tx.model.Transaction'
        },
        {
          name: 'applyTo',
          of: 'net.nanopay.tx.model.Transaction'
        }
     ],
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      if ( transaction == null ) {
        return transaction;
      }
        DAO transactionFeesDAO = (DAO) x.get("transactionFeesDAO");
        List applicableFees = ((ArraySink) transactionFeesDAO
              .where(MLang.AND(
                  MLang.EQ(TransactionFee.TRANSACTION_NAME, transaction.getName()),  // TODO: Fix Transaction.getCls()
                  MLang.EQ(TransactionFee.DENOMINATION, transaction.getSourceCurrency()),
                  MLang.LTE(TransactionFee.MIN_AMOUNT, transaction.getAmount()),
                  MLang.OR(
                      MLang.GTE(TransactionFee.MAX_AMOUNT, transaction.getAmount()),
                      MLang.EQ(TransactionFee.MAX_AMOUNT, 0)
                  )
              ))
              .select(new ArraySink())).getArray();

          if ( applicableFees.size() > 0 ) {
            for (Object applicableFee : applicableFees) {
              TransactionFee fee = (TransactionFee) applicableFee;
              Long feeAccount = fee.getFeeAccount();
              if ( feeAccount > 0 ) {
                FeeLineItem[] forward = new FeeLineItem [] {
                  new FeeLineItem.Builder(x).setNote(fee.getName()).setFeeAccount(fee.getFeeAccount()).setAmount(fee.getFee().getFee(transaction.getAmount())).build()
                };
                InfoLineItem[] reverse = new InfoLineItem [] {
                  new InfoLineItem.Builder(x).setNote(fee.getName()+" - Non-refundable").setAmount(fee.getFee().getFee(transaction.getAmount())).build()
                };
                applyTo.addLineItems(x, forward, reverse);
              }
            }
          }
          return applyTo;
    `
    },
  ]
});
