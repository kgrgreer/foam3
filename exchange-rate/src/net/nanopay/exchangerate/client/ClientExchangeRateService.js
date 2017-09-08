foam.CLASS({
  package: 'net.nanopay.exchangerate.client',
  name: 'ClientExchangeRateService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.exchangerate.ExchangeRateInterface',
      name: 'delegate'
    }
  ]
});
