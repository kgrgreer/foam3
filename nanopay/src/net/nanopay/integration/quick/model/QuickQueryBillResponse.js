foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryBillResponse',
  documentation: 'Class for Bill import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryBills',
      name: 'QueryResponse'
    }
  ]
});
