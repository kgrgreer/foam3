foam.CLASS({
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcBatchRecord',

  documentation: `RBC Batch`,

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'batchCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'batchControl',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcBatchControl',
    },
    {
      name: 'ciRecords',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcCIRecord'
    },
    {
      name: 'coRecords',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.rbc.iso20022file.RbcCORecord'
    },
  ],
});
