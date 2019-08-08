foam.CLASS({
  package: 'net.nanopay.accounting.resultresponse',
  name: 'InvoiceResponseItem',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'invoiceNumber'
    },
    {
      class: 'String',
      name: 'Amount'
    },
    {
      class: 'String',
      name: 'dueDate'
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});
