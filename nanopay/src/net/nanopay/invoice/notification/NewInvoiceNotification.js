foam.ENUM({
  package: 'net.nanopay.invoice.notification',
  name: 'InvoiceNotificationType',

  documentation: 'Invoice notification type.',

  values: [
    {
      name: 'RECEIVABLE',
      label: 'receivable'
    },
    {
      name: 'PAYABLE',
      label: 'payable'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.invoice.notification',
  name: 'NewInvoiceNotification',
  extends: 'foam.nanos.notification.Notification',

  documentation: 'Notification for a new payable or receivable invoice.',

  properties: [
    {
      class: 'Long',
      name: 'invoiceId'
    }
  ]
});
