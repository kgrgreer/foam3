foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'Liquidity',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.EnabledAware'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enabled',
      documentation: 'Determines whether Liquidity is active, and notifications and/or re-balancing is to occur',
      value: true
    },
    {
      class: 'Boolean',
      name: 'rebalancingEnabled',
      documentation: 'Triggeres automatic transaction on accounts.'
    },
    {
      class: 'Currency',
      name: 'threshold',
      documentation: 'The balance when liquidity should be triggered.'
    },
    {
      class: 'Currency',
      name: 'resetBalance',
      visibilityExpression: function(enableRebalancing) {
        return enableRebalancing ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      documentation: 'Account balance must match reset amount after liquidity transaction was generated.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'pushPullAccount',
      label: 'push/pull account',
      visibilityExpression: function(enableRebalancing) {
        return enableRebalancing ? foam.u2.Visibility.RW : foam.u2.Visibility.HIDDEN;
      },
      documentation: 'Account associated to setting.',
      view: function(_, X) {
        return foam.u2.view.RichChoiceView.create({
          search: true,
          selectionView: { class: 'net.nanopay.ui.AccountSelectionView' },
          rowView: { class: 'net.nanopay.ui.AccountRowView' },
          sections: [
            {
              dao: X.accountDAO
            }
          ]
        });
      }
    }
  ]
});
