foam.CLASS({
  // NOTE: We need to use this package and name for faceted to work.
  package: 'net.nanopay.account',
  name: 'AccountDAOUpdateView',
  extends: 'foam.comics.v2.DAOUpdateView',

  documentation: `A custom DAOUpdateView for Accounts in Liquid.`,

  properties: [
    ['viewView', { class: 'net.nanopay.liquidity.ui.account.AccountDetailView' }]
  ]
});
