foam.CLASS({
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcBatchControl',

  documentation: `RBC file control record`,

  properties: [
    {
      name: 'totalValueOfD',
      class: 'Long'
    },
    {
      name: 'totalNumberOfD',
      class: 'Int'
    },
    {
      name: 'totalValueOfC',
      class: 'Long',
    },
    {
      name: 'totalNumberOfC',
      class: 'Int'
    }
  ],
});
