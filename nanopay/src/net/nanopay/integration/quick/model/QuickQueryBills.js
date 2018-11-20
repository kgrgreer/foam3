foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryBills',
  documentation: 'Class for Bill import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryBill',
      name: 'Bill'
    },
  ]
});
