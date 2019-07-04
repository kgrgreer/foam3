foam.CLASS({
  package: 'net.nanopay.invoice.service',
  name: 'ClientInvoicePaymentService',

  implements: [
    'net.nanopay.invoice.service.InvoicePaymentService'
  ],

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      name: 'delegate',
      of: 'net.nanopay.invoice.service.InvoicePaymentService',
      factory: function() {
        return this.SessionClientBox.create({
          delegate: this.HTTPBox.create({
            method: 'POST',
            url: this.serviceName
          })
        });
      },
      swiftFactory: `
return SessionClientBox_create(["delegate": HTTPBox_create([
  "method": "POST",
  "url": serviceName
])])
      `
    }
  ]
});
