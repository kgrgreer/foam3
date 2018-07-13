foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'ReceivePaymentNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Long',
      name: 'invoiceId'
    }
  ]
});
