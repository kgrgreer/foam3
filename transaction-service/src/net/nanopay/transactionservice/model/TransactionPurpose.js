foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'TransactionPurpose',

  documentation: 'Purpose of the transaction',

  properties: [
    {
      class: 'Boolean',
      name: 'proprietary'
    },
    {
      class: 'String',
      name: 'code'
    }
  ]
});