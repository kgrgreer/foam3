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
        if ( causeDaoKey !== '' ) {
          var key = causeDaoKey;
          if( ! this.__context__[key] ) {
            // if DAO doesn't exist in context, change daoKey from localMyDAO
            // (server-side) to myDAO (accessible on front-end)
            key = key.substring(5,6).toLowerCase() + key.substring(6);
          }
          this.__subContext__[key].find(causeId).then((obj) => {
            this.causeObject = obj;
          });
        }
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
