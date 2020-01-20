foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'ClientAccountHierarchyService',

  // TODO: re-evaluate the need for these things existing

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.liquidity.tx.AccountHierarchy',
      name: 'delegate'
    }
  ]
});
