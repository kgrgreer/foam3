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
  package: 'net.nanopay.partner.bpp.tx.planner',
  name: 'BPPTransactionPlanner',
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
    'net.nanopay.partner.bpp.tx.BPPTransaction',
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
      value: 'BPP'
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
      txn.setAmount(0);
      BPPTransaction bppTx = new BPPTransaction();
      bppTx.copyFrom(requestTxn);
      bppTx.setId(UUID.randomUUID().toString());
      bppTx.setAmount(0);
      bppTx.setName("BPP transaction");
      bppTx.setPaymentProvider(PAYMENT_PROVIDER);
      bppTx.setPlanner(this.getId());
      bppTx = addNatureCodeLineItems(x, bppTx, requestTxn);
      bppTx = addFxLineItems(x, bppTx, requestTxn, fxRate);
      txn.addNext(bppTx);
      ExternalTransfer[] exT = new ExternalTransfer[1];
      exT[0] = new ExternalTransfer(quote.getDestinationAccount().getId(), bppTx.getDestinationAmount());
      bppTx.setTransfers( exT );
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
        if ( ! (txn instanceof BPPTransaction) ) {
          return true;
        }
        NatureCodeLineItem natureCode = null;
        BPPTransaction transaction = (BPPTransaction) txn;;
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
        if ( txn instanceof BPPTransaction ) {
          BPPTransaction transaction =(BPPTransaction) txn;
          // -- Copy line items
          transaction.setLineItems(root.getLineItems());
          // Add transfer for source amount
          ExternalTransfer ext = new ExternalTransfer(transaction.getSourceAccount(), -root.getAmount());
          Transfer[] transfers = (Transfer[]) ArrayUtils.add(transaction.getTransfers(), ext);
          // Add transfers for fees from summary
          transfers =  (Transfer[]) ArrayUtils.addAll(transfers, root.getTransfers());
          transaction.setTransfers(transfers);
          root.setTransfers(null);
        }
        return super.postPlanning(x,txn,root);
      `
    },
    {
      name: 'addNatureCodeLineItems',
      javaType: 'BPPTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'BPPTransaction',
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
      javaType: 'BPPTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'BPPTransaction',
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