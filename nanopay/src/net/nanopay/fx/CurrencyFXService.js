foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'CurrencyFXService',

  documentation: 'Lookop of FXService based on Source and Destination Currency',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'sourceCurrency'
    },
    {
      class: 'String',
      name: 'destCurrency'
    },
    {
      class: 'String',
      name: 'nSpecId',
      documentation: 'name/id of FXService to use.'
    }
  ]
});
