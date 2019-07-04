foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimitType',

  documentation: 'Available Types for Transaction Limits',

  values: [
    {
      name: 'SEND',
      label: 'Send'
    },
    {
      name: 'RECEIVE',
      label: 'Receive'
    }
  ]
});
