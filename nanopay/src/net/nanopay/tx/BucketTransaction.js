foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BucketTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.Amount',
      name: 'subTransactions',
      storageTransient: true,
      documentation: `
        Amounts to be transfered as part of the bucket transaction.
      `,
    }
  ]
});
