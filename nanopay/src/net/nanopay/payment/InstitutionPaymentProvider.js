foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'InstitutionPaymentProvider',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentProvider',
      name: 'paymentProvider'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution'
    }
  ]
});
