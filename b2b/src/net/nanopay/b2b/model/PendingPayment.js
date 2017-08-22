foam.CLASS({
  package: 'net.nanopay.b2b.model',
  name: 'PendingPayment',

  documentation: 'Pending payment information.',

  properties: [
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
      name: 'scheduleDate',
      required: true
    },
    {
      class: 'Date',
      name: 'paymentDate'
    },
    {
      name: 'invoiceId',
      required: true
    },
    {
      name: 'payerUserId',
      required: true
    },
    {
      class: 'String',
      name: 'status'
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