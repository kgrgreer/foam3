foam.CLASS({
  // NOTE: We need to use this package and name for faceted to work.
  package: 'foam.nanos.auth',
  name: 'UserDAOUpdateView',
  extends: 'foam.comics.v2.DAOUpdateView',

  documentation: `A custom DAOUpdateView for Users in Liquid.`,

  properties: [
    ['viewView', { class: 'net.nanopay.liquidity.ui.user.LiquidUserDetailView' }]
  ]
});
