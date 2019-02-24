foam.CLASS({
  package: 'net.nanopay.tx.model',
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
      class: 'Currency',
      name: 'threshold',
      documentation: 'The balance when liquidity should be triggered.'
    },
    {
      class: 'Currency',
      name: 'reset',
      documentation: 'Account balance must much reset amount after liquidity transaction was generated.'
    },
    // {
    //   class: 'Enum',
    //   of: 'net.nanopay.tx.model.Frequency',
    //   name: 'cashOutFrequency',
    //   documentation: 'Determines how often a automatic cash out can occur.'
    // },
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
