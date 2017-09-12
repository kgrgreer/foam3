foam.CLASS({
  package: 'net.nanopay.tx.client',
  name: 'ClientTransactionService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.tx.TransactionService',
      name: 'delegate'
    }
  ]
});
