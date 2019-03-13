foam.CLASS({
  package: 'net.nanopay.accounting.quickbooks.model',
  name: 'QuickbooksInvoice',
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

