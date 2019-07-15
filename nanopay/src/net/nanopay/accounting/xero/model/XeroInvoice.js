foam.CLASS({
  package: 'net.nanopay.accounting.xero.model',
  name: 'XeroInvoice',
  extends: 'net.nanopay.invoice.model.Invoice',
  documentation: 'Class for Invoices imported from Xero Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'xeroOrganizationId'
    },
    {
      class: 'String',
      name: 'businessName'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'xeroUpdate',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'complete',
      hidden: true,
      value: false
    },
    {
      class: 'Long',
      name: 'lastUpdated',
      documentation: ' When this invoice was last updated on xero.'
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      label: 'Xero Last Updated',
      visibility: 'RO'
    }
  ]
});
