/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
foam.CLASS({
  package: 'net.nanopay.partner.bepay.tx.planner',
  name: 'BepayTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans BRL to USD',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.util.UUID',
    'java.util.Calendar',
    'java.util.Date',
    'net.nanopay.country.br.tx.ExchangeLimitTransaction',
    'net.nanopay.country.br.tx.NatureCodeLineItem',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.partner.bepay.tx.BepayTransaction',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'org.apache.commons.lang.ArrayUtils',
  ],
properties: [
    {
      name: 'bestPlan',
      value: true
    }
  ],

  messages: [
    {
      name: 'INVALID_NATURE_CODE',
      message: 'Invalid nature code',
    }
  ],

  constants: [
    {
      name: 'PAYMENT_PROVIDER',
      type: 'String',
      value: 'BePay'
    }
  ],

  methods: [
    {
      name: 'createLimit',
      documentation: 'Creates a limit check transaction and returns it',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'ExchangeLimitTransaction',
      javaCode: `
        ExchangeLimitTransaction elt = new ExchangeLimitTransaction();
        elt.copyFrom(txn);
        elt.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        elt.setName("Exchange TxLimit Transaction");
        elt.clearTransfers();
        elt.clearLineItems();
        elt.setPlanner(getId());
        elt.clearNext();
        elt.setId(UUID.randomUUID().toString());
        return elt;
      `
    },
    {
      name: 'plan',
      javaCode: `
      //TODO: add api call to retrieve fx rate
      Double fxRate = 3.0;
      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.setPaymentProvider(PAYMENT_PROVIDER);
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.clearLineItems();
      txn.setAmount( (long) (requestTxn.getDestinationAmount() * fxRate) ); // if rate is in different format, need / here instead of *
      BepayTransaction bTx = new BepayTransaction();
      bTx.copyFrom(requestTxn);
      bTx.setId(UUID.randomUUID().toString());
      bTx.setAmount(txn.getAmount());
      bTx.setName("BePay transaction");
      bTx.setPaymentProvider(PAYMENT_PROVIDER);
      bTx.setPlanner(this.getId());
      bTx = addNatureCodeLineItems(x, bTx, requestTxn);
      bTx = addFxLineItems(x, bTx, requestTxn, fxRate);
      txn.addNext(bTx);
      ExternalTransfer[] exT = new ExternalTransfer[2];
      exT[0] = new ExternalTransfer(quote.getDestinationAccount().getId(), bTx.getDestinationAmount());
      exT[1] = new ExternalTransfer(quote.getSourceAccount().getId(), bTx.getAmount());
      bTx.setTransfers( exT );
      return txn;
    `
    },
    {
      name: 'validatePlan',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        if ( ! (txn instanceof BepayTransaction) ) {
          return true;
        }
        NatureCodeLineItem natureCode = null;
        BepayTransaction transaction = (BepayTransaction) txn;;
        for (TransactionLineItem lineItem: txn.getLineItems() ) {
          if ( lineItem instanceof NatureCodeLineItem ) {
            natureCode = (NatureCodeLineItem) lineItem;
            break;
          }
        }
        if ( natureCode == null || SafetyUtil.isEmpty(natureCode.getNatureCode()) ) {
          throw new RuntimeException("[Transaction Validation error]"+ this.INVALID_NATURE_CODE);
        }
        return true;
      `
    },
    {
      name: 'postPlanning',
      javaCode: `
        return super.postPlanning(x,txn,root);
      `
    },
    {
      name: 'addNatureCodeLineItems',
      javaType: 'BepayTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'BepayTransaction',
        },
        {
          name: 'requestTxn',
          type: 'Transaction'
        }
      ],
      javaCode: `
      NatureCodeLineItem natureCode = null;
        for (TransactionLineItem lineItem: requestTxn.getLineItems() ) {
          if ( lineItem instanceof NatureCodeLineItem ) {
            natureCode = (NatureCodeLineItem) lineItem;
            break;
          }
        }
        if ( natureCode == null ) {
          natureCode = new NatureCodeLineItem();
        }
        txn.addLineItems( new TransactionLineItem[] { natureCode } );
        return txn;
      `
    },
    {
      name: 'addFxLineItems',
      javaType: 'BepayTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'BepayTransaction',
        },
        {
          name: 'requestTxn',
          type: 'Transaction'
        },
        {
          name: 'fxRate',
          type: 'Double'
        }
      ],
      javaCode: `
      Calendar c = Calendar.getInstance();
      c.setTime(new Date());
      c.add(Calendar.DATE, 1);
      txn.addLineItems( new TransactionLineItem[] {
        new FXLineItem.Builder(x)
          .setGroup("fx").setNote("FX Broker Fee")
          .setDestinationAccount(requestTxn.getSourceAccount())
          .setSourceCurrency(requestTxn.getSourceCurrency())
          .setDestinationCurrency(requestTxn.getDestinationCurrency())
          .setExpiry(c.getTime())
          .setRate(fxRate)
          .build()
      } );
      return txn;
      `
    },
    {
      name: 'createFeeTransfers',
      javaCode: `
        TransactionLineItem [] ls = txn.getLineItems();
        for ( TransactionLineItem li : ls ) {
          if ( li instanceof FeeLineItem && ! (li instanceof InvoicedFeeLineItem) ) {
            FeeLineItem feeLineItem = (FeeLineItem) li;
            ExternalTransfer ext = new ExternalTransfer(feeLineItem.getSourceAccount(), -feeLineItem.getAmount());
            ExternalTransfer ext2 = new ExternalTransfer(feeLineItem.getDestinationAccount(), feeLineItem.getAmount());
            Transfer[] transfers = { ext, ext2 };
            txn.add(transfers);
          }
        }
        return txn;
      `
    }
  ]
});