/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Base class of Exchange Rate Transactions.
Stores all Exchange Rate info.`,

  implements: [
    'net.nanopay.tx.AcceptAware'
  ],

  javaImports: [
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FeesFields',

    'java.util.Arrays',
  ],

  properties: [
    {
      name: 'fxRate',
      class: 'Double'
    },
    {
      name: 'fxExpiry',
      class: 'DateTime'
    },
    {
      name: 'accepted',
      class: 'Boolean',
      value: false
    },
    {
      name: 'fxQuoteId', // or fxQuoteCode
      class: 'String'
    },
    {
      name: 'fxFees',
      class: 'FObjectProperty',
      of: 'net.nanopay.fx.FeesFields'
    },
    {
      name: 'fxSettlementAmount',
      class: 'Double'
    },
    {
      class: 'Currency',
      name: 'destinationAmount',
      label: 'Destination Amount',
      description: 'Amount in Receiver Currency',
      visibility: 'RO',
      tableCellFormatter: function(destinationAmount, X) {
        var formattedAmount = destinationAmount/100;
        this
          .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    }
  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
      ],
      javaCode: `
/* nop */
`
},
{
  name: 'createTransfers',
  args: [
    {
      name: 'x',
      javaType: 'foam.core.X'
    },
    {
      name: 'oldTxn',
      javaType: 'Transaction'
    }
  ],
  javaReturns: 'Transfer[]',
  javaCode: `
    Transfer[] tr = new Transfer [] {
      new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-getTotal()).build(),
      new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(getDestinationAmount()).build()
    };
    Transfer[] replacement = Arrays.copyOf(getTransfers(), getTransfers().length + tr.length);
    System.arraycopy(tr, 0, replacement, getTransfers().length, tr.length);
    return replacement;

  `
},
  ]
});
