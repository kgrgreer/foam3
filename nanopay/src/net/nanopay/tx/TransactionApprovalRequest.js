/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionApprovalRequest',
  extends: 'foam.nanos.approval.ApprovalRequest',

  documentation: `
    TransactionApprovalRequest links a transactionId to an approval request
  `,

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'paymentId',
      label: 'Reference',
      section: 'approvalRequestInformation',
      order: 25,
      gridColumns: 6
    }
  ]
});
