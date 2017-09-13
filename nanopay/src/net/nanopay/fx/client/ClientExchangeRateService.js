foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'ClientExchangeRateService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.ExchangeRateInterface',
      name: 'delegate'
    }
  ]
});
