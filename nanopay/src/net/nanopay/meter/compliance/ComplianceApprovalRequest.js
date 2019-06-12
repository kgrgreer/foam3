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
    },
    {
      class: 'FObjectProperty',
      name: 'causeObjectHelper',
      transient: true,
      visibility: 'HIDDEN',
      expression: function(causeId, causeDaoKey) {
        this.__subContext__[causeDaoKey].find(causeId).then((obj) => {
          this.causeObject = obj;
        });
        return null;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'causeObject',
      transient: true,
      visibility: 'RO'
    }
  ]
});
