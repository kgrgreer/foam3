foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'TransactionRefinement',
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'Int',
      name: 'clearingTime',
      documentation: 'Clearing time (in days).',
      permissionRequired: true
    }
  ]
});
