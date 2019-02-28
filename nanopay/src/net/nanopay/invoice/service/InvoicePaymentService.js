foam.INTERFACE({
  package: 'net.nanopay.invoice.service',
  name: 'InvoicePaymentService',

  methods: [
    {
      name: 'pay',
      async: true,
      type: 'net.nanopay.invoice.model.Invoice',
      swiftThrows: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'invoiceId',
          type: 'Long'
        }
      ]
    }
  ]
});
