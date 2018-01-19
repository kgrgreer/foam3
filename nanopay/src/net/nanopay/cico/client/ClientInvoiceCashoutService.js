foam.CLASS({
  package: 'net.nanopay.cico.client',
  name: 'ClientInvoiceCashoutService',

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.cico.service.InvoiceCashoutService',
      name: 'delegate'
    }
  ]
});
