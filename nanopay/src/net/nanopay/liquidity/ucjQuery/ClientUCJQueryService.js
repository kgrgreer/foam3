foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'ClientUCJQueryService',

  // TODO: re-evaluate the need for these things existing

  implements: [
    'net.nanopay.liquidity.ucjQuery.UCJQueryService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.liquidity.ucjQuery.UCJQueryService',
      name: 'delegate'
    }
  ]
});
