foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionPurpose',

  documentation: 'Purpose of the transaction',

  properties: [
    {
      class: 'String',
      name: 'proprietary',
      documentation: 'Whether the purpose code is proprietary or not. Used for ISO20022'
    },
    {
      class: 'String',
      name: 'code',
      documentation: 'Purpose code'
    }
  ]
});
