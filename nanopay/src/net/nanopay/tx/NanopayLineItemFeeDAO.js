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
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.InvoiceTransaction',
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
      if ( transaction == null ||
        ! ( transaction instanceof InvoiceTransaction ) ||
        ! ((InvoiceTransaction) transaction).getPayable() ) {
        return transaction;
      }

      DAO lineItemFeeDAO = (DAO) x.get("lineItemFeeDAO");
      DAO typeAccountDAO = (DAO) x.get("lineItemTypeAccountDAO");

      int numFees = 0;

      List allFees = ((ArraySink)lineItemFeeDAO.select(new ArraySink())).getArray();
      for ( Object af: allFees ) {
        LineItemFee y = (LineItemFee) af;
        logger.debug("(ALL) LineItemFee", y);
      }

      for ( TransactionLineItem lineItem : transaction.getLineItems() ) {
        List fees = ((ArraySink) lineItemFeeDAO
          .where(
            MLang.AND(
              MLang.EQ(LineItemFee.ENABLED, true),
              MLang.EQ(LineItemFee.FOR_TYPE, lineItem.getType())
            )
          )
          .select(new ArraySink())).getArray();

        LineItemType lineItemType = lineItem.findType(x);

        if ( fees.size() == 0 ) {
          logger.debug(this.getClass().getSimpleName(), "applyFees", "no applicable fees found for transaction", transaction, "type", transaction.getType(), "amount", transaction.getAmount(), "LineItem", lineItem, "LineItemType", lineItemType);
        }

          for (Object f : fees ) {
            LineItemFee fee = (LineItemFee) f;
            logger.debug("LineItemFee: ", fee);
            User payee = applyTo.findDestinationAccount(x).findOwner(x);
            Long feeAccountId = 0L;
            LineItemTypeAccount lineItemTypeAccount = (LineItemTypeAccount) typeAccountDAO.find(
              MLang.AND(
                MLang.EQ(LineItemTypeAccount.ENABLED, true),
                MLang.EQ(LineItemTypeAccount.USER, payee.getId()),
                MLang.EQ(LineItemTypeAccount.TYPE, fee.getFeeType())
              )
            );

            if ( lineItemTypeAccount == null ) {
              Account account = DigitalAccount.findDefault(x, payee, "CAD");
              feeAccountId = account.getId();
            } else {
              feeAccountId = lineItemTypeAccount.getAccount();
            }
            Long amount = fee.getFeeAmount(transaction.getAmount());
            if ( feeAccountId > 0 &&
                 amount > 0L ) {
              FeeLineItem[] forward = new FeeLineItem [] {
                new FeeLineItem.Builder(x).setType(fee.getFeeType()).setFeeAccount(feeAccountId).setAmount(amount).setNote(lineItemType.getName()).build()
              };
              TransactionLineItem[] reverse;
              if ( fee.getRefundable() ) {
                // REVIEW - see FeeLineItem.createTransfers and sourcePaysFee
                reverse = new FeeLineItem[] {
                  new FeeLineItem.Builder(x).setType(fee.getFeeType()).setFeeAccount(transaction.getSourceAccount()).setAmount(amount).setNote(lineItemType.getName()).build()
                };
              } else {
                reverse = new InfoLineItem [] {
                  new InfoLineItem.Builder(x).setType(fee.getFeeType()).setNote(lineItemType.getName()+ " Non-refundable").setAmount(amount).build()
                };
              }
              applyTo.addLineItems(forward, reverse);
              logger.debug(this.getClass().getSimpleName(), "applyFees", "forward", forward[0], "reverse", reverse[0], "transaction", transaction);
            }
          }
        }
      return applyTo;
    `
    },
  ]
});
