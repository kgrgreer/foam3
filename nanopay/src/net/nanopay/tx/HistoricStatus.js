foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'HistoricStatus',

  documentation: 'Timestamped transaction status.',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'timeStamp',
      //javaFactory: 'return new Date();',
      //factory: 'return new DateTime;',
      documentation: 'Time at which status entry was created'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status'
    },
  ]
 });
