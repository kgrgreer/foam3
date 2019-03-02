foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionStatus',

  documentation: 'Status for transactions. Purpose of each status would depend on the implementation. The documentation in this file will descibe only existing models.',

  values: [
    {
      name: 'PENDING',
      label: 'Pending',
      documentation: 'CICO: as soon as cico transaction is created it takes PENDING status until it is sent to EFT.'
    },
    {
      name: 'REVERSE',
      label: 'Reverse',
      documentation: 'CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE status occurs when balance reverted successfully. Should never be set manully, the status is calculated.'
    },
    {
      name: 'REVERSE_FAIL',
      label: 'ReverseFail',
      documentation: 'CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE_FAIL status occurs when balance failed to revert. Should never be set manully, the status is calculated.'
    },
    {
      name: 'SENT',
      label: 'Sent',
      documentation: 'CICO: transaction takes status SENT when automatically generated CSV file with transactions is sent to EFT.'
    },
    {
      name: 'DECLINED',
      label: 'Declined',
      documentation: 'CICO: transaction that was rejected by EFT.'
    },
    {
      name: 'COMPLETED',
      label: 'Completed',
      documentation: 'Base transaction: status indicating that transaction was successfully proccessed. CICO: after waiting period(2days), we assume transaction was successfully proccessed.'
    },
    {
      name: 'REFUNDED',
      label: 'Refunded',
      documentation: 'Retail transaction: status of a transaction that was refunded.'
    },
    {
      name: 'ACSP',
      label: 'ACSP'
    },
    {
      name: 'ACSC',
      label: 'ACSC'
    },
    {
      name: 'FAILED',
      label: 'Failed',
      documentation: 'CICO: in case confirmation files indicates invalid transactions, those transactions take FAILED status.'
    },
    {
      name: 'PAUSED',
      label: 'Paused',
      documentation: 'CICO: PAUSED transactions are being ignored by the system. Example: transaction was voided on EFT portal, the transaction should be marked as PAUSED within the system.' // REVIEW
    },
    {
      name: 'CANCELLED',
      label: 'Cancelled'
    },
    {
      name: 'PENDING_PARENT_COMPLETED',
      label: 'Pending Parent Completed',
      documentation: 'Chained transaction: child transactions are in PENDING_PARENT_COMPLETED and being ignored by the system until all parents go to COMPLETED state.'
    },
  ]
});
