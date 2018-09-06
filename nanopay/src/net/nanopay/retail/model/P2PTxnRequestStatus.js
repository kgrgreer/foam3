foam.ENUM({
  package: 'net.nanopay.retail.model',
  name: 'P2PTxnRequestStatus',

  documentation: 'Status for a P2P txn request',

  values: [
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
    },
    {
      name: 'CANCELLED',
      label: 'Canceled'
    }
  ]
});

