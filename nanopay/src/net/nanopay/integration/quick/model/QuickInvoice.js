foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickInvoice',
  extends: 'net.nanopay.invoice.model.Invoice',
  documentation: 'Class for Invoices imported from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'quickId'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'quickUpdate',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'complete',
      hidden: true,
      value: false,
    }
  ]
});

