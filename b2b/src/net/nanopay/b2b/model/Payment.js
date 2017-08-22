foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'Payment',

  documentation: 'Payment information.',

  properties: [
    {
      class: 'String',
      name: 'vtmb64',
      required: true
    },
    {
      name: 'payerUserId',
      required: true
    },
    {
      name: 'payerBusinessId',
      required: true
    },
    {
      name: 'payeeBusinessId',
      required: true
    },
    {
      class: 'Date',
      name: 'paymentDate',
      required: true
    },
    {
      class: 'Date',
      name: 'scheduleDate'
    },
    {
      name: 'invoiceId',
      required: true
    },
    {
      class: 'Double',
      name: 'amount',
      required: true
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});