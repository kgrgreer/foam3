foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'GetFXQuote',

  documentation: 'API to get FX Quote',

  properties: [
    {
      class: 'String',
      name: 'valueDate'
    },
    {
      class: 'String',
      name: 'sourceCurrency'
    },
    {
      class: 'String',
      name: 'targetCurrency'
    },
    {
      class: 'Long',
      name: 'sourceAmount',
      value: 0
    },
    {
      class: 'Long',
      name: 'targetAmount',
      value: 0
    },
    {
        class: 'String',
        name: 'fxDirection'
    }
  ]
});
