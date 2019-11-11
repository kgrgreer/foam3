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
    'foam.nanos.auth.User',
    'java.util.Arrays',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.fx.ExchangeRateStatus',
    'net.nanopay.fx.FeesFields',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.model.Business',
    'net.nanopay.tx.AcceptAware',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.util.Frequency'
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
      class: 'Double',
      section: 'paymentInfo',
      visibilityExpression: function(fxRate) {
        return ! fxRate ?
          foam.u2.Visibility.HIDDEN :
          foam.u2.Visibility.RO;
      },
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
      name: 'paymentMethod',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        super.validate(x);

        User sourceOwner = findSourceAccount(x).findOwner(x);
        if ( sourceOwner instanceof Business
          && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
        ) {
          throw new RuntimeException("Sender needs to pass business compliance.");
        }

        User destinationOwner = findDestinationAccount(x).findOwner(x);
        if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
          // We throw when the destination account owner failed compliance however
          // we obligate to not expose the fact that the user failed compliance.
          throw new RuntimeException("Receiver needs to pass compliance.");
        }
      `
    },
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
}
  ]
});
