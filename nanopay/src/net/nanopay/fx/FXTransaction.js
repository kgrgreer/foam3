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
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.fx.ExchangeRateStatus'
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
      name: 'fxStatus',
      class: 'Enum',
      of: 'net.nanopay.fx.ExchangeRateStatus',
    },
    {
      name: 'fxQuoteId', // or fxQuoteCode
      class: 'String'
    },
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
        // Call aceptRate
`
    }
  ]
});
