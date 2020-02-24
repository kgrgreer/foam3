foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'ClientCorridorService',
  documentation: 'Service to check support for corridors and currency pair.',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.payment.CorridorService',
      name: 'delegate'
    }
  ]
});
