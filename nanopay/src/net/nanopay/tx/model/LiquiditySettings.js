foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'LiquiditySettings',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  ids: ['account'],

  plural: 'Liquidity Settings',

  css: `
  .foam-u2-view-RichChoiceView-container {
    z-index:1;
  }
  `,
  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.DigitalAccount',
      targetDAOKey: 'accountDAO',
      name: 'account',
      view: function(_, X) {
        return foam.u2.view.RichChoiceView.create({
          search: true,
          selectionView: { class: 'net.nanopay.ui.AccountSelectionView', accountDAO: X.accountDAO },
          rowView: { class: 'net.nanopay.ui.AccountRowView' },
          sections: [
            {
              dao: X.accountDAO,
            }
          ],
        });
      },
      documentation: 'Primary key and reference to account that liquidity settings are executed on. Can be instanceof DigitalAccount only.'
    },
    {
      class: 'Boolean',
      name: 'enableCashIn',
      documentation: 'Determines automatic cash in processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'minimumBalance',
      documentation: 'Determines minimum balance' +
         ' required for automatic cash in.'
    },
    {
      class: 'Boolean',
      name: 'enableCashOut',
      documentation: 'Determines automatic cash out processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'maximumBalance',
      documentation: 'Determines maximum balance' +
          ' required for automatic cash out.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.model.Frequency',
      name: 'cashOutFrequency',
      documentation: 'Determines how often a automatic cash out can occur.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'bankAccountId', // TODO: rename to account
      documentation: 'Account associated to setting.',
      view: function(_, X) {
        return foam.u2.view.RichChoiceView.create({
          search: true,
          selectionView: { class: 'net.nanopay.ui.AccountSelectionView', accountDAO: X.accountDAO  },
          rowView: { class: 'net.nanopay.ui.AccountRowView' },
          sections: [
            {
              dao: X.accountDAO,
            }
          ],
        });
      }
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'GroupRefine',
  refines: 'foam.nanos.auth.Group',

  properties: [
    {
      name: 'liquiditySettings',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.LiquiditySettings',
      factory: function() { return net.nanopay.tx.model.LiquiditySettings.create(); }
    }
  ]
});
