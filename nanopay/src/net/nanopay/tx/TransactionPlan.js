foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionPlan',

  properties: [
    {
      name: 'expiry',
      class: 'DateTime'
    },
    {
      name: 'eta',
      class: 'Long'
    },
    {
      name: 'cost',
      class: 'Long'
    },
    {
      name: 'transaction',
      of: 'FObject'
    }
  ]
});
