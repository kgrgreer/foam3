foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickBank',
  documentation: 'Class for Banks imported from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'Name'
    },
    {
      class: 'String',
      name: 'AccountType'
    },
    {
      class: 'String',
      name: 'AccountSubType'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'CurrencyRef'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});

