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
      visibility: 'RO',
      documentation: 'Time at which status entry was created'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status'
    },
  ]
 });
