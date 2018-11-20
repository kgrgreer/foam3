foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryCustomers',
  documentation: 'Class for Customer import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryContact',
      name: 'Customer'
    },
  ]
});
