foam.CLASS({
  package: 'net.nanopay.transactionservice',
  name: 'ClientTransactionService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.transactionservice.TransactionService',
      name: 'delegate'
    }
  ]
});
