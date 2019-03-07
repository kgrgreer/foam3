foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'Liquidity',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enableRebalancing',
      documentation: 'Triggeres automatic transaction on accounts.'
    },
    {
      class: 'Boolean',
      name: 'enableNotification',
      documentation: 'enables notifications.'
    },
    {
      class: 'Currency',
      name: 'threshold',
      documentation: 'The balance when liquidity should be triggered.'
    },
    {
      class: 'Currency',
      name: 'resetBalance',
      documentation: 'Account balance must match reset amount after liquidity transaction was generated.'
    },
    {
      name: 'pushPullOwner',
      transient: true,
      hidden: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'pushPullAccount',
      label: 'push/pull account',
      documentation: 'Account associated to setting.',
      postSet: function(_, acc) {
        if ( ! acc ) return null;
        this.pushPullAccount$find.then(function(account) {
          this.pushPullOwner = account.owner;
        }.bind(this));
      },
      view: function(_, X) {
        return X.data.slot(function(pushPullOwner) {
        if ( ! pushPullOwner ) return 'Choose Account First';
          return foam.u2.view.RichChoiceView.create({
            search: true,
            selectionView: { class: 'net.nanopay.ui.AccountSelectionView', accountDAO: X.accountDAO  },
            rowView: { class: 'net.nanopay.ui.AccountRowView' },
            sections: [
              {
                dao: X.accountDAO.where(X.data.EQ(net.nanopay.account.Account.OWNER, pushPullOwner))
              },
              {
                heading: 'Other Accounts',
                dao: X.accountDAO.where(X.data.NEQ(net.nanopay.account.Account.OWNER, pushPullOwner))
              }
            ]
          });
        });
      }
    }
  ]
});
