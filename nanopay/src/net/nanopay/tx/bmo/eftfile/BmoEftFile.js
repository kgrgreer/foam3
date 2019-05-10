foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoEftFile',

  documentation: `BMO EFT file`,

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'headerRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoFileHeader',
    },
    {
      name: 'batchRecords',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.bmo.eftfile.BmoBatchRecord'
    },
    {
      name: 'trailerRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoFileControl',
    },
    {
      name: 'filePath',
      class: 'String'
    },
    {
      name: 'env',
      class: 'String',
      documentation: 'value could be "sandbox" or "production". '
    }
  ],
});
