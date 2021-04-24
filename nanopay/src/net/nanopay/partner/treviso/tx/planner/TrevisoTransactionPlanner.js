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
foam.CLASS({
  package: 'net.nanopay.partner.treviso.tx.planner',
  name: 'TrevisoTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans BRL to USD',

  javaImports: [
    'foam.util.SafetyUtil',
    'java.time.LocalDateTime',
    'java.util.Date',
    'java.util.UUID',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.ExpiryLineItem',
    'net.nanopay.tx.ExternalTransfer',
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.FeeLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.country.br.tx.ExchangeLimitTransaction',
    'net.nanopay.partner.treviso.TrevisoService',
    'net.nanopay.country.br.tx.NatureCodeLineItem',
    'net.nanopay.partner.treviso.tx.TrevisoTransaction',
    'org.apache.commons.lang.ArrayUtils'
  ],

  properties: [
    {
      name: 'bestPlan',
      value: true
    },
    {
      class: 'Long',
      name: 'expiryMinutes',
      value: 5
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
      value: 'Treviso'
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

      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.setPaymentProvider(PAYMENT_PROVIDER);
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.clearLineItems();

      txn.setAmount(0);

      txn.addNext(createComplianceTransaction(txn));
      txn.addNext(createLimit(txn));

      TrevisoTransaction trevisoTxn = new TrevisoTransaction();
      trevisoTxn.copyFrom(requestTxn);
      trevisoTxn.setId(UUID.randomUUID().toString());
      trevisoTxn.setAmount(0);
      trevisoTxn.setName("Treviso transaction");
      trevisoTxn.setPaymentProvider(PAYMENT_PROVIDER);
      trevisoTxn.setPlanner(this.getId());
      trevisoTxn = addNatureCodeLineItems(x, trevisoTxn, requestTxn);

      // Expire transaction plan after x minutes 
      ExpiryLineItem exp = new ExpiryLineItem();
      LocalDateTime expiry = LocalDateTime.now();
      expiry = expiry.plusMinutes(getExpiryMinutes());
      Date date = java.util.Date.from(expiry.atZone(java.time.ZoneId.systemDefault()).toInstant());
      exp.setExpiry(date);
      exp.setName("Treviso FX Expiry");
      trevisoTxn.addLineItems( new TransactionLineItem[] { exp } );
      txn.addNext(trevisoTxn);
      
      // TODO: evaluate helper methods on the intended transaction instead of the head.
      /* quote.addExternalTransfer(quote.getDestinationAccount().getId(), trevisoTxn.getDestinationAmount());
      quote.addExternalTransfer(quote.getSourceAccount().getId(), - trevisoTxn.getAmount());*/
      ExternalTransfer[] exT = new ExternalTransfer[1];
      exT[0] = new ExternalTransfer(quote.getDestinationAccount().getId(), trevisoTxn.getDestinationAmount());
      trevisoTxn.setTransfers( exT );

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
        if ( ! (txn instanceof TrevisoTransaction) ) {
          return true;
        }
        NatureCodeLineItem natureCode = null;
        TrevisoTransaction transaction = (TrevisoTransaction) txn;;

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
        if ( txn instanceof TrevisoTransaction ) {
          TrevisoTransaction transaction =(TrevisoTransaction) txn;

          // -- Copy line items
          transaction.setLineItems(root.getLineItems());
          
          // Add transfer for source amount
          ExternalTransfer ext = new ExternalTransfer(transaction.getSourceAccount(), -root.getAmount());
          Transfer[] transfers = (Transfer[]) ArrayUtils.add(transaction.getTransfers(), ext);

          // Update the amount
          transaction.setAmount(root.getAmount());

          // Add transfers for fees from summary
          transfers =  (Transfer[]) ArrayUtils.addAll(transfers, root.getTransfers());
          transaction.setTransfers(transfers);
          root.setTransfers(null);
        } else if ( txn instanceof ExchangeLimitTransaction ) {
          ExchangeLimitTransaction exchange = (ExchangeLimitTransaction) txn;
          exchange.setAmount(root.getAmount());
        }
        return super.postPlanning(x,txn,root);
      `
    },
    {
      name: 'addNatureCodeLineItems',
      javaType: 'TrevisoTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'TrevisoTransaction',
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
    },
  ]
});
