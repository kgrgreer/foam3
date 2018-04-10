foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshInvoiceResponse',
  properties: [
    {
      class:'FObjectProperty',
      of: 'net.nanopay.fresh.model.FreshInvoiceResult',
      name: 'response'
    }
  ]
})