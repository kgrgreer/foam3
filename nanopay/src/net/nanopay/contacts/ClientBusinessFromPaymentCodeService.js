foam.CLASS({
  package: 'net.nanopay.contacts',
  name: 'ClientBusinessFromPaymentCodeService',

  implements: [
    'net.nanopay.contacts.BusinessFromPaymentCodeInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.contacts.BusinessFromPaymentCodeInterface',
      name: 'delegate'
    }
  ]
});
