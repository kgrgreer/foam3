foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionRecord',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'java.util.Date'
  ],

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
