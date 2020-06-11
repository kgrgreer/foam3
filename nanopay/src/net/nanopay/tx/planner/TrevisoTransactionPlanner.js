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
  package: 'net.nanopay.tx.planner',
  name: 'TrevisoTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans BRL to USD',

  javaImports: [
    'foam.util.SafetyUtil',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.fx.treviso.NatureCode',
    'net.nanopay.fx.treviso.TrevisoTransaction',
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

  methods: [
    {
      name: 'plan',
      javaCode: `

      FXSummaryTransaction txn = new FXSummaryTransaction();
      txn.copyFrom(requestTxn);
      txn.clearLineItems();

      // TODO replace with real logic once api is completed
      txn.setAmount(requestTxn.getDestinationAmount()*5);
      txn.setDestinationCurrency("USD");
      TrevisoTransaction placeHolder = new TrevisoTransaction();
      placeHolder.copyFrom(requestTxn);
      placeHolder.setAmount(requestTxn.getDestinationAmount()*5);
      placeHolder.setName("Treviso transaction");
      placeHolder.setIsQuoted(true);
      placeHolder.setPlanner(this.getId());
      this.addLineItems(x, placeHolder, requestTxn);

      FXLineItem fxLineItem = new FXLineItem();
      fxLineItem.setRate(5);
      placeHolder.addLineItems( new TransactionLineItem[] { fxLineItem } );
      txn.setStatus(TransactionStatus.COMPLETED);
      txn.addNext(placeHolder);
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
        NatureCode natureCode = null;
        TrevisoTransaction transaction = (TrevisoTransaction) txn;;

        for (TransactionLineItem lineItem: txn.getLineItems() ) {
          if ( lineItem instanceof NatureCode ) {
            natureCode = (NatureCode) lineItem;
            break;
          }
        }

        if ( natureCode == null || SafetyUtil.isEmpty(natureCode.getPurposeCode()) ) {
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
        NatureCode natureCode = null;
        for (TransactionLineItem lineItem: requestTxn.getLineItems() ) {
          if ( lineItem instanceof NatureCode ) {
            natureCode = (NatureCode) lineItem;
            break;
          }
        }

        if ( natureCode == null ) {
          natureCode = new NatureCode();
        }
        txn.addLineItems( new TransactionLineItem[] { natureCode } );

        return txn;
      `
    },
  ]
});
