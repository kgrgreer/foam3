foam.CLASS({
  package: 'net.nanopay.liquidity.ui.dashboard.currencyExposure',
  name: 'CurrencyExposure',
  ids: ['denomination'],
  properties: [
    {
      class: 'String',
      name: 'denomination'
    },
    {
      class: 'Long',
      name: 'total'
    }
  ]
});
