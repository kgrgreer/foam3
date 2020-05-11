foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FailedTransactionNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      name: 'groupId',
      value: 'payment-ops',
      javaValue: '"payment-ops"'
    },
    ['emailName', 'failed-transaction'],
    ['notificationType', 'FailedTransactions'],
    {
      name: 'body',
      expression: function(transactionId, invoiceId) {
        return `Transaction ${transactionId} failed and requires investigation. The associated invoice's id is ${invoiceId}.`;
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transactionId',
      documentation: 'The id of the transaction that failed.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceId',
      documentation: `
        The id of the invoice associated with the transaction that failed.
      `
    }
  ]
});

