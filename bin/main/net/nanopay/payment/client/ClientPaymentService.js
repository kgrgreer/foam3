foam.CLASS({
  package: 'net.nanopay.payment.client',
  name: 'ClientPaymentService',

  implements: [
    'net.nanopay.payment.PaymentService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.payment.PaymentService',
      name: 'delegate'
    }
  ]
});
