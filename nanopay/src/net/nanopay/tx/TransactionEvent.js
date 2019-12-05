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
      name: 'record'
    },
    {
      class: 'DateTime',
      name: 'created'
    }
  ]
  });
