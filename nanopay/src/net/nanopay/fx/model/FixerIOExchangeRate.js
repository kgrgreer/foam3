foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'FixerIOExchangeRate',

  documentation: 'Modelled version of fixer.io exchange rate response',

  properties: [
    {
      class: 'String',
      name: 'base'
    },
    {
      class: 'String',
      name: 'date'
    },
    {
      class: 'Map',
      name: 'rates'
    }
  ]
});
