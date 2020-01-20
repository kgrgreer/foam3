foam.CLASS({
  package: 'net.nanopay.account',
  name: 'ClientBalanceService',

  // TODO: re-evaluate the need for these things existing

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.account.BalanceServiceInterface',
      name: 'delegate'
    }
  ]
});
