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
      class: 'Double',
      name: 'sourceAmount',
      value: 0
    },
    {
      class: 'Double',
      name: 'targetAmount',
      value: 0
    },
    {
        class: 'String',
        name: 'fxDirection'
    }
  ]
});
