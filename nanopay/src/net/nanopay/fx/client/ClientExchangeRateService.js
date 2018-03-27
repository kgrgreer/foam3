foam.CLASS({
  package: 'net.nanopay.fx.client',
  name: 'ClientExchangeRateService',

  implements: [
    'net.nanopay.fx.ExchangeRateInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.fx.ExchangeRateInterface',
      name: 'delegate'
    }
  ]
});
