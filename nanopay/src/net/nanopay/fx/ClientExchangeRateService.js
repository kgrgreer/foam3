foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ClientExchangeRateService',

  // TODO: re-evaluate the need for these things existing

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.ExchangeRateServiceInterface',
      name: 'delegate'
    }
  ]
});
