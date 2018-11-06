foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryInvoices',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryInvoice',
      name: 'Invoice'
    }
  ]
});
