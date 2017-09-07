foam.CLASS({
  package: 'net.nanopay.interact.client',
  name: 'ClientExchangeRateService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.exchangerate.ExchangeRateInterface',
      name: 'delegate'
    }
  ]
});