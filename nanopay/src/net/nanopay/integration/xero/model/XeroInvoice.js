foam.CLASS({
  package: 'net.nanopay.integration.xero.model',
  name: 'XeroInvoice',
  extends: 'net.nanopay.invoice.model.Invoice',
  properties: [
    {
      class: 'Boolean',
      name: 'desync'
    }
  ]
})