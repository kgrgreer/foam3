foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryVendors',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryContact',
      name: 'Vendor'
    },
  ]
});
