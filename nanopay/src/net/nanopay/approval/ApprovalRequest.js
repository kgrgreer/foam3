foam.CLASS({
  package: 'net.nanopay.approval',
  name: 'ApprovalRequest',

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Sequence number'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      documentation: 'the user that is requested for approval.'
    },
    {
      class: 'Long',
      name: 'objId'
    },
    {
      class: 'String',
      name: 'daoKey',
      documentation: ''
    }
  ]
});
