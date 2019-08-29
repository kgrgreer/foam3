// TODO: make clearingTimes property storage transient as it could be re-generated
// via probing assuming the applicable rules for the transaction are un-changed.
//
// Eg.,
//
//    RulerProbe probe = new RulerProbe();
//    probe.setObject(transaction);
//    probe.setOperation(Operations.UPDATE);
//    probe = (RulerProbe) transactionDAO.cmd(probe);
//
// Currently it doesn't work on the transactions already sit in SENT status
// because the predicate of clearing time rules checks for changes on status (to
// SENT) instead of the value of the status property itself.

const clearingTimes = {
  class: 'Map',
  name: 'clearingTimes',
  documentation: 'Clearing times of a transaction.',
  help: 'A list of clearing times applied to the transaction when sent.',
  visibility: 'RO',
  permissionRequired: true,
  javaType: 'java.util.Map<String, Integer>',
  javaFactory: 'return new java.util.HashMap<>();'
};

foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'CITransactionRefinement',
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [ clearingTimes ]
});

foam.CLASS({
  package: 'net.nanopay.meter.clearing',
  name: 'COTransactionRefinement',
  refines: 'net.nanopay.tx.model.COTransaction',

  properties: [ clearingTimes ]
});
