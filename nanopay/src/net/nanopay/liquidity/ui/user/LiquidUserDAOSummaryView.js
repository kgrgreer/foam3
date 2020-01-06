foam.CLASS({
  // NOTE: We need to use this package and name for faceted to work.
  package: 'foam.nanos.auth',
  name: 'UserDAOSummaryView',
  extends: 'foam.comics.v2.DAOSummaryView',

  documentation: 'A custom DAOSummaryView for Users in Liquid.',

  properties: [
    ['viewView', { class: 'net.nanopay.liquidity.ui.user.LiquidUserDetailView' }]
  ]
});
