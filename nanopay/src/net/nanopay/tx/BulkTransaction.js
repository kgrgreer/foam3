foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'BulkTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  properties: [
    {
      name: 'explicitCI',
      class: 'Boolean',
      value: true
    },
    {
      name: 'explicitCO',
      class: 'Boolean',
      value: true
    }
  ]
});
