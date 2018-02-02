foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshInvoiceResult',
  properties: [
    {
      class:'FObjectProperty',
      of: 'net.nanopay.fresh.model.FreshInvoicePages',
      name: 'result'
    }
  ]
})