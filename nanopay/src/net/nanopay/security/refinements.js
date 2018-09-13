foam.CLASS({
  refines: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.security.Signature',
      name: 'signatures',
      documentation: 'List of signatures for a given transaction'
    }
  ]
});
