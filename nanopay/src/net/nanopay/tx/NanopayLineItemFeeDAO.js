/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'NanopayLineItemFeeDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
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
        quote.getPlans()[i] = applyFees(x, quote.getPlans()[i], quote.getPlans()[i]);
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

      DAO feesDAO = (DAO) x.get("lineItemFeeDAO");
      DAO typeAccountDAO = (DAO) x.get("lineItemTypeAccountDAO");

      int numFees = 0;

      for ( TransactionLineItem lineItem : transaction.getLineItems ) {
        List fees = ((ArraySink) lineItemFeeDAO
          .where(
            MLang.AND(
              MLang.EQ(LineItemFee.ENABLED, true),
              MLang.EQ(LineItemFee.FOR_TYPE, lineItem.getType())
            )
          )
          .select(new ArraySink())).getArray();

        if ( fees.size() > 0 ) {
          numFees += fees.size();
          for (Object f : fees ) {
            LineItemFee fee = (LineItemFee) f;
            User payee = applyTo.findDestinationAccount(x).findOwner(x);
            Long feeAccount = typeAccountDAO.find(
              MLang.AND(
                MLang.EQ(LineItemTypeAccount.ENABLED, true),
                MLang.EQ(LineItemTypeAccount.USER, payee.getId()),
                MLang.EQ(LineItemTypeAccount.TYPE, fee.feeType)
              )
            );
            if ( feeAccount <= 0 ) {
              Account account = DigitalAccount.findDefault(x, payee, 'CAD');
              feeAccount = account.getId();
            }
            if ( feeAccount > 0 ) {
              FeeLineItem[] forward = new FeeLineItem [] {
                new FeeLineItem.Builder(x).setType(fee.getFeeType()).setFeeAccount(feeAccount).setAmount(fee.getFeeAmount(transaction.getAmount())).build()
              };
              if ( fee.getRefundable() ) {
                InfoLineItem[] reverse = new InfoLineItem [] {
                  new InfoLineItem.Builder(x).setType(fee.getFeeType()).setAmount(fee.getFeeAmount(transaction.getAmount())).build()
                };
              } else {
                InfoLineItem[] reverse = new InfoLineItem [] {
                  new InfoLineItem.Builder(x).setType(fee.getFeeType()).setNote("Non-refundable").setAmount(fee.getFeeAmount(transaction.getAmount())).build()
                };
              }
              applyTo.addLineItems(forward, reverse);
              logger.debug(this.getClass().getSimpleName(), "applyFees", "forward", forward[0], "reverse", reverse[0], "transaction", transaction);
            }
          }
        }
      }
      if ( numFees == 0 ) {
        logger.debug(this.getClass().getSimpleName(), "applyFees", "no applicable fees found for transaction", transaction, "type", transaction.getType(), "amount", transaction.getAmount());
      }
      return applyTo;
    `
    },
  ]
});
