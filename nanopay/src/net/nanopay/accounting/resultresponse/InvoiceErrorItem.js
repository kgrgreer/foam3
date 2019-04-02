foam.CLASS({
  package: 'net.nanopay.accounting.resultresponse',
  name: 'InvoiceErrorItem',

  properties: [
    {
      class: 'String',
      name: 'invoiceNumber'
    },
    {
      class: 'String',
      name: 'Amount'
    },
    {
      class: 'Date',
      name: 'dueDate'
    }
  ]
});
