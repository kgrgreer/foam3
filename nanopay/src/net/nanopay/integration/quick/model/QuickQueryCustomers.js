foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryCustomers',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryContact',
      name: 'Customer'
    },
  ]
});
