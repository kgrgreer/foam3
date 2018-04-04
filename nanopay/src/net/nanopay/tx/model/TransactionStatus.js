foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionStatus',

  documentation: 'Status for CICO transactions',

  values: [
    {
      name: 'PENDING',
      label: 'Pending'
    },
    {
      name: 'SENT',
      label: 'Sent'
    },
    {
      name: 'DECLINED',
      label: 'Declined'
    },
    {
      name: 'COMPLETED',
      label: 'Completed'
    },
    {
      name: 'ACSP',
      label: 'ACSP'
    },
    {
      name: 'ACSC',
      label: 'ACSC'
    }
  ]
});