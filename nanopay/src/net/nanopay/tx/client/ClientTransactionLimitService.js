foam.CLASS({
  package: 'net.nanopay.tx.client',
  name: 'ClientTransactionLimitService',

  implements: [
    'net.nanopay.tx.TransactionLimitServiceInterface'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.tx.TransactionLimitServiceInterface',
      name: 'delegate'
    }
  ]
});