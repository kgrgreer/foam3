foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'TransactionRefinement',
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'Map',
      name: 'clearingTimes',
      documentation: 'Clearing times of a transaction.',
      help: 'A map of ClearingTimeRule (sub-)class name and duration (in days).',
      permissionRequired: true,
      javaType: 'java.util.Map<String, Integer>',
      javaFactory: 'return new java.util.HashMap<>();'
    }
  ]
});
