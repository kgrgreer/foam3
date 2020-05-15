foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PaymentMethod',

  documentation: 'This model defines payment methods such as ACH, WIRE etc.',

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name'
    }
  ]
});
