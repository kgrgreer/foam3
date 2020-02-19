foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'ClientCorridorService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.payment.CorridorService',
      name: 'delegate'
    }
  ]
});
