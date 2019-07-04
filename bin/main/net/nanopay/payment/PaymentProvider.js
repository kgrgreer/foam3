foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentProvider',

  documentation: 'Payment Provider.',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the Payment Provider.'
    }
  ]
});
