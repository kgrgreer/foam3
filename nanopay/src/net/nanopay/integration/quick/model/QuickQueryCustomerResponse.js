foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryCustomerResponse',
  documentation: 'Class for Customer import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryCustomers',
      name: 'QueryResponse'
    }
  ]
});
