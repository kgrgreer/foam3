foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshInvoicePages',
  properties: [
    {
      class:'FObjectArray',
      of: 'net.nanopay.fresh.model.FreshInvoice',
      name: 'invoices'
    },
    {
      class:'String',
      name: 'per_page'
    },
    {
      class:'String',
      name: 'total'
    },
    {
      class:'String',
      name: 'page'
    },
    {
      class:'String',
      name: 'pages'
    }
  ]
})