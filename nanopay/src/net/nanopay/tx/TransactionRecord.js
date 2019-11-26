foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionRecord',

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
