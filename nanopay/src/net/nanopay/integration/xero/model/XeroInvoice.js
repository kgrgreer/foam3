foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroInvoice',
  extends: 'net.nanopay.invoice.model.Invoice',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'xeroUpdate',
      hidden: true
    }
  ]
})