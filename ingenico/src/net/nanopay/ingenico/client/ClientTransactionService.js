foam.CLASS({
  package: 'net.nanopay.ingenico.client',
  name: 'ClientTransactionService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.transactionservice.TransactionService',
      name: 'delegate'
    }
  ]
});