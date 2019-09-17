foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionStatus',

  documentation: 'Status for transactions. Purpose of each status would depend on the implementation. The documentation in this file will descibe only existing models.',

  values: [
    {
      name: 'PENDING',
      label: 'Pending',
      documentation: 'CICO: as soon as cico transaction is created it takes PENDING status until it is sent to EFT.',
      ordinal: 0
    },
    {
      // deprecated
      name: 'REVERSE',
      label: 'Reverse',
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE status occurs when balance reverted successfully. Should never be set manully, the status is calculated.',
      ordinal: 1
    },
    {
      // deprecated
      name: 'REVERSE_FAIL',
      label: 'ReverseFail',
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE_FAIL status occurs when balance failed to revert. Should never be set manully, the status is calculated.',
      ordinal: 2
    },
    {
      name: 'SENT',
      label: 'Sent',
      documentation: 'CICO: transaction takes status SENT when automatically generated CSV file with transactions is sent to EFT.',
      ordinal: 3
    },
    {
      name: 'DECLINED',
      label: 'Declined',
      documentation: 'CICO: transaction that was rejected by EFT.',
      ordinal: 4
    },
    {
      name: 'COMPLETED',
      label: 'Completed',
      documentation: 'Base transaction: status indicating that transaction was successfully proccessed. CICO: after waiting period(2days), we assume transaction was successfully proccessed.',
      ordinal: 5
    },
    {
      // deprecated
      name: 'REFUNDED',
      label: 'Refunded',
      documentation: 'DEPRECATED. Retail transaction: status of a transaction that was refunded.',
      ordinal: 6
    },
    {
      // deprecated
      name: 'ACSP',
      label: 'ACSP',
      documentation: 'DEPRECATED. Accepted, Settlement Pending: The transaction has been received by nanopay and is sent to the partner bank for credit. (PacsMessage)',
      ordinal: 7
    },
    {
      // deprecated
      name: 'ACSC',
      label: 'ACSC',
      documentation: ' DEPRECATED. Accepted, Settlement Complete: The transaction has been successfully completed within the ecosystem and the funds are credited to the beneficiary account. (PacsMessage)',
      ordinal: 8
    },
    {
      name: 'FAILED',
      label: 'Failed',
      documentation: 'CICO: in case confirmation files indicates invalid transactions, those transactions take FAILED status.',
      ordinal: 9
    },
    {
      name: 'PAUSED',
      label: 'Paused',
      documentation: 'CICO: PAUSED transactions are being ignored by the system. Example: transaction was voided on EFT portal, the transaction should be marked as PAUSED within the system.', // REVIEW
      ordinal: 10
    },
    {
      name: 'CANCELLED',
      label: 'Cancelled',
      ordinal: 11
    },
    {
      name: 'PENDING_PARENT_COMPLETED',
      label: 'Pending Parent Completed',
      documentation: 'Chained transaction: child transactions are in PENDING_PARENT_COMPLETED and being ignored by the system until all parents go to COMPLETED state.',
      ordinal: 12
    },
    {
      name: 'SCHEDULED',
      label: 'Scheduled',
      documentation: 'Scheduled transaction specifies the time when transaction needs to be processsed.',
      ordinal: 13
    }
  ]
});
