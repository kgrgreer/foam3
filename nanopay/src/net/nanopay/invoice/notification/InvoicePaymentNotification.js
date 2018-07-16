foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'InvoicePaymentNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice',
    }
  ]
});
