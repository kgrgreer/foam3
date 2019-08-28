foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'TransactionRefinement',
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'Map',
      name: 'clearingTimes',
      documentation: 'Clearing times of a transaction.',
      help: 'A list of clearing times applied to the transaction when sent.',
      visibility: 'RO',
      permissionRequired: true,
      javaType: 'java.util.Map<String, Integer>',
      javaFactory: 'return new java.util.HashMap<>();'
    }
  ]
});
