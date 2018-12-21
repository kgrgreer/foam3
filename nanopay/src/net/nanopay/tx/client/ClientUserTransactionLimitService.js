foam.CLASS({
  package: 'net.nanopay.tx.client',
  name: 'ClientUserTransactionLimitService',

  implements: [
    'net.nanopay.tx.UserTransactionLimit'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.tx.UserTransactionLimit',
      name: 'delegate'
    }
  ]
});
