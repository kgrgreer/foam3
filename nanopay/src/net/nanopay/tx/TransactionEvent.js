foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionEvent',

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'event'
    },
    {
      class: 'DateTime',
      name: 'created'
    }
  ]
  });
