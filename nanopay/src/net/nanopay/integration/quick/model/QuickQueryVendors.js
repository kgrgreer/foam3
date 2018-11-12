foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryVendors',
  documentation: 'Class for Vendor import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryContact',
      name: 'Vendor'
    },
  ]
});
