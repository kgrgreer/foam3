foam.CLASS({
  package: 'net.nanopay.meter.compliance',
  name: 'ComplianceApprovalRequest',
  extends: 'net.nanopay.approval.ApprovalRequest',

  properties: [
    {
      name: 'status',
      value: 'REQUESTED',
    },
    {
      class: 'Long',
      name: 'causeId'
    },
    {
      class: 'String',
      name: 'causeDaoKey'
    }
  ]
});
