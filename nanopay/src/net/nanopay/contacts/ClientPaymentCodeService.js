foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ClientPaymentCodeService',

  implements: [
    'net.nanopay.contacts.PaymentCodeServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.contacts.PaymentCodeServiceInterface',
      name: 'delegate'
    }
  ]
});
