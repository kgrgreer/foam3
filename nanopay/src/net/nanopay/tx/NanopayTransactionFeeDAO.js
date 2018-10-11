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

  constants: [
    {
      type: 'long',
      name: 'NANOPAY_FEE_ACCOUNT_ID',
      value: 2
    }
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
      Transaction transaction = (Transaction) obj;
      DAO transactionFeesDAO = (DAO) x.get("transactionFeesDAO");
      List applicableFees = ((ArraySink) transactionFeesDAO
          .where(MLang.EQ(TransactionFee.TRANSACTION_CLASS, transaction.getCls())) //TODO: Evaluate Max Amount
          .select(new ArraySink())).getArray();

      if ( applicableFees.size() > 0 ) {
        for (Object applicableFee : applicableFees) {
          TransactionFee fee = (TransactionFee) applicableFee;
          Long feeAccount = fee.getFeeAccount();
          if ( null == feeAccount ) feeAccount = NANOPAY_FEE_ACCOUNT_ID; //REVEIW

          FeeTransfer[] tr = new FeeTransfer [] {
            new FeeTransfer.Builder(x).setAccount(transaction.getSourceAccount())
                .setAmount(-fee.getFee().getFee(transaction.getAmount())).build(),
            new FeeTransfer.Builder(x).setAccount(feeAccount)
                .setAmount(fee.getFee().getFee(transaction.getAmount())).build()
          };
          transaction.add(tr);
        }

      }

      return super.put_(x, transaction);
    `
    },
  ]
});
