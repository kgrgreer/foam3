foam.CLASS({
  // NOTE: We need to put this in the foam.nanos.auth package for faceted to work.
  package: 'foam.nanos.auth',
  name: 'UserDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  documentation: `Used to create new users in Liquid.`,

  properties: [
    ['viewView', { class: 'net.nanopay.liquidity.ui.user.LiquidUserDetailView' }]
  ]
});
