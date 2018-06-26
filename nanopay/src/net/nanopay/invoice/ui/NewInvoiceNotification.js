foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'NewInvoiceNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
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
    },
    {
      class: 'String',
      name: 'invoiceType'
    }
  ]
  });
