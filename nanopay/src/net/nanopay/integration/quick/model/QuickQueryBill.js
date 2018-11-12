foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryBill',
  documentation: 'Class for Bill from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'Id'
    },
    {
      class: 'String',
      name: 'TxnDate'
    },
    {
      class: 'String',
      name: 'DueDate'
    },
    {
      class: 'String',
      name: 'DocNumber'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryCurrencyReference',
      name: 'CurrencyRef'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryNameValue',
      name: 'VendorRef'
    },
    {
      class: 'Double',
      name: 'TotalAmt'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
  ]
});
