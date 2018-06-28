foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'ReceivePaymentNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Long',
      name: 'invoiceId'
    },
    {
      class: 'String',
      name: 'invoiceNumber'
    },
    {
      class: 'Currency',
      name: 'amount',
      aliases: ['a'],
      precision: 2
    },
    {
      class: 'Long',
      name: 'fromUserId'
    }
  ]
});
