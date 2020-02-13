foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'ClientAccountUCJQueryService',

  // TODO: re-evaluate the need for these things existing

  implements: [
    'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.liquidity.ucjQuery.AccountUCJQueryService',
      name: 'delegate'
    }
  ]
});
