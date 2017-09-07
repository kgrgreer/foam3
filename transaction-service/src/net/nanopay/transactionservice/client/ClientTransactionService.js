foam.CLASS({
  package: 'net.nanopay.transactionservice.client',
  name: 'ClientTransactionService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.transactionservice.TransactionService',
      name: 'delegate'
    }
  ]
});
