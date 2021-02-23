/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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

