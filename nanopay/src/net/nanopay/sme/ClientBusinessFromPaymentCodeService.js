foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'ClientBusinessFromPaymentCodeService',

  implements: [
    'net.nanopay.sme.BusinessFromPaymentCodeInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.sme.BusinessFromPaymentCodeInterface',
      name: 'delegate'
    }
  ]
});
