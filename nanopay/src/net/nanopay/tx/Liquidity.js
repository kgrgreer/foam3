foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Liquidity',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enable',
      documentation: 'Triggeres automatic transaction on accounts.'
    },
    {
      class: 'Boolean',
      name: 'notify',
      documentation: 'enables notifications.'
    },
    {
      class: 'Currency',
      name: 'threshold',
      documentation: 'The balance when liquidity should be triggered.'
    },
    {
      class: 'Currency',
      name: 'reset',
      documentation: 'Account balance must match reset amount after liquidity transaction was generated.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'fundAccount',
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
