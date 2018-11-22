foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryInvoiceResponse',
  documentation: 'Class for Invoice import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryInvoices',
      name: 'QueryResponse'
    }
  ]
});
