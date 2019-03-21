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
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.liquidity.Frequency',
    'net.nanopay.account.Account',
    'java.util.Arrays',
  ],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Foreign Exchange';
      },
      javaFactory: `
        return "Foreign Exchange";
      `
    },
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
    }
  ],

  methods: [
    {
      name: 'accept',
      args: [
        {
          name: 'x',
          type: 'Context'
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
      type: 'Context'
    },
    {
      name: 'oldTxn',
      type: 'net.nanopay.tx.model.Transaction'
    }
  ],
  type: 'net.nanopay.tx.Transfer[]',
  javaCode: `
    return getTransfers();
  `
},
{
  documentation: `LiquidityService checks whether digital account has any min or/and max balance if so, does appropriate actions(cashin/cashout)`,
  name: 'checkLiquidity',
  args: [
    {
      name: 'x',
      type: 'Context'
    }
  ],
  javaCode: `
  LiquidityService ls = (LiquidityService) x.get("liquidityService");
  Account source = findSourceAccount(x);
  Account destination = findDestinationAccount(x);
  ls.liquifyAccount(source.getId(), Frequency.PER_TRANSACTION, -getAmount());
  ls.liquifyAccount(destination.getId(), Frequency.PER_TRANSACTION, getAmount());
  `
}
  ]
});
