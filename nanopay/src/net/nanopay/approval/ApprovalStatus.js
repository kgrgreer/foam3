foam.ENUM({
  package: 'net.nanopay.approval',
  name: 'ApprovalStatus',

  values: [
    {
      name: 'REQUESTED',
      label: 'Pending',
      documentation: 'Request pending.'
    },
    {
      name: 'APPROVED',
      label: 'Approved',
      documentation: 'Request was approved.'
    },
    {
      name: 'REJECTED',
      label: 'Rejected',
      documentation: 'Request was rejected.'
    }
  ]
});
