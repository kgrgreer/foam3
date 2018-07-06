foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Long',
      name: 'invoiceId'
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
    },
    {
      class: 'String',
      name: 'invoiceType'
    }
  ]
  });
