foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryInvoices',
  documentation: 'Class for Invoice import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryInvoice',
      name: 'Invoice'
    }
  ]
});
