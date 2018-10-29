foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryBills',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryBill',
      name: 'Bill'
    },
  ]
});
