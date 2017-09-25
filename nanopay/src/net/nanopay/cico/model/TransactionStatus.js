foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'TransactionStatus',

  documentation: 'Status for CICO transactions',

  values: [
    {
      name: 'NEW',
      label: 'New'
    },
    {
      name: 'PENDING',
      label: 'Pending'
    },
    {
      name: 'ACCEPTED',
      label: 'Accepted'
    },
    {
      name: 'DECLINED',
      label: 'Declined'
    }
  ]
});