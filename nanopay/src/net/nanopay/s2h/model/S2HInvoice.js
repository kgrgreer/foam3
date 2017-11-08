foam.CLASS({
  package: 'net.nanopay.s2h.model',
  name: 'S2HInvoice',

  documentation: 'S2H Invoice model.',

  ids: [ 'id' ],

  javaImports: [ 'java.util.Date' ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'Long',
      name: 'invoiceNum'
    },
    {
      class: 'Date',
      name: 'date'
    },
    {
      class: 'Date',
      name: 'dueDate'
    },
    {
      class: 'Date',
      name: 'datePaid'
    },
    {
      class: 'Double',
      name: 'subTotal'
    },
    {
      class: 'Double',
      name: 'credit'
    },
    {
      class: 'Double',
      name: 'tax'
    },
    {
      class: 'Double',
      name: 'tax2'
    },
    {
      class: 'Double',
      name: 'total'
    },
    {
      class: 'Double',
      name: 'taxRate'
    },
    {
      class: 'Double',
      name: 'taxRate2'
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'paymentMethod'
    },
    {
      class: 'String',
      name: 'notes'
    },
    {
      class: 'String',
      name: 'currencyCode'
    },
    {
      class: 'String',
      name: 'currencyPrefix'
    },
    {
      class: 'String',
      name: 'currencySuffix'
    }

  ]

});
