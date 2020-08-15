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
    'java.util.UUID',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.country.br.tx.ExchangeLimitTransaction',
    'net.nanopay.partner.treviso.tx.NatureCodeLineItem',
    'net.nanopay.partner.treviso.tx.TrevisoTransaction',
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
      message: 'Invalid nature code.',
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
        elt.setIsQuoted(true);
        elt.setId(UUID.randomUUID().toString());
        return elt;
      `
    },
    {
      name: 'plan',
      javaCode: `

      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.clearLineItems();

      // TODO replace with real logic once api is completed
      txn.setAmount(requestTxn.getDestinationAmount()*5);
      txn.setDestinationCurrency("USD");

      txn.addNext(createCompliance(txn));
      txn.addNext(createLimit(txn));

      TrevisoTransaction placeHolder = new TrevisoTransaction();
      placeHolder.copyFrom(requestTxn);
      placeHolder.setAmount(requestTxn.getDestinationAmount()*5);
      placeHolder.setName("Treviso transaction");
      placeHolder.setPaymentProvider(PAYMENT_PROVIDER);
      placeHolder.setIsQuoted(true);
      placeHolder.setPlanner(this.getId());
      this.addLineItems(x, placeHolder, requestTxn);

      FXQuote fxQuote = new FXQuote();
      fxQuote.setSourceCurrency("USD");
      fxQuote.setTargetCurrency("BRL");
      fxQuote.setRate(5.0);

      FXLineItem fxLineItem = new FXLineItem();
      fxLineItem.setRate(fxQuote.getRate());
      fxLineItem.setSourceCurrency(fxQuote.findSourceCurrency(x));
      fxLineItem.setDestinationCurrency(fxQuote.findTargetCurrency(x));
      placeHolder.addLineItems( new TransactionLineItem[] { fxLineItem } );
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.addNext(applyFee(x, quote, placeHolder));
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
      name: 'addLineItems',
      javaType: 'Transaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'Transaction',
        },
        {
          name: 'requestTxn',
          type: 'net.nanopay.tx.model.Transaction'
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
  ]
});
