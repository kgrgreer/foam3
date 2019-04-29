foam.ENUM({
  package: 'net.nanopay.approval',
  name: 'ApprovalStatus',

  values: [
    {
      name: 'REQESTED',
      label: 'Requested',
      documentation: 'Request was sent.'
    },
    {
      name: 'APPROVED',
      label: 'Approved',
      documentation: 'Request was approved.'
    },
    {
      name: 'REJECTED',
      label: 'Rejecdted',
      documentation: 'Request was rejected.'
    }
  ]
});
