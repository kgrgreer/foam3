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
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'sourceCurrency',
      value: 'CA'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'destCurrency',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'nSpecId',
      documentation: 'name/id of FXService to use.'
    }
  ]
});
