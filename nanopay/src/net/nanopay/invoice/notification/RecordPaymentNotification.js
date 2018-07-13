foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'RecordPaymentNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Long',
      name: 'invoiceId'
    }
  ]
});
