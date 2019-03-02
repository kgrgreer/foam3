foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryVendorResponse',
  documentation: 'Class for Vendor import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryVendors',
      name: 'QueryResponse'
    }
  ]
});
