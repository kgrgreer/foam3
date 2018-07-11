foam.ENUM({
  package: 'net.nanopay.invoice.notification',
  name: 'InvoiceType',

  documentation: 'Invoice type',

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

  documentation: 'Notification for new payable/receivale invoice',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice',
    }
  ]
});
