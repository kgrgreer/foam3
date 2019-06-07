foam.CLASS({
  package: 'net.nanopay.approval',
  name: 'ApprovalRequest',
  documentation: 'Approval requests are stored in approvalRequestDAO and' +
  'represent a single approval request for a single user.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'net.nanopay.approval.ApprovalStatus'
  ],

  imports: [
    'approvalRequestDAO'
  ],

  tableColumns: [
    'id',
    'refObj',
    'approver',
    'status',
    'memo',
    'approve',
    'reject',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO',
      documentation: 'Sequence number.'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      visibility: 'RO',
      documentation: 'the user that is requested for approval.',
      tableCellFormatter: function(approver) {
        let self = this;
        this.__subSubContext__.userDAO.find(approver).then((user)=> {
          if ( user && user.group ) {
            self.add(user.group);
          } else {
            self.add(approver);
          }
        });
      }
    },
    {
      class: 'String',
      name: 'objId',
      visibility: 'RO',
      documentation: 'id of the object that needs approval.'
    },
    {
      class: 'String',
      name: 'daoKey',
      visibility: 'RO',
      documentation: 'dao where the object can be found(based on objId).'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.approval.ApprovalStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'memo',
      label: 'Notes',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 },
      documentation: 'description of the request.'
    },
    {
      class: 'String',
      name: 'token',
      visibility: 'RO',
      documentation: 'token in email for ‘click to approve’.'
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'refObj',
      transient: true,
      expression: function(daoKey, objId){
        return daoKey + ':' + objId;
      },
      hidden: true
    }
  ],

  actions: [
    {
      name: 'approve',
      label: 'Approve Request',
      code: function() {
        this.status = this.ApprovalStatus.APPROVED;
        this.approvalRequestDAO.put(this);
        this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
      },
    },
    {
      name: 'reject',
      label: 'Reject Request',
      code: function() {
        this.status = this.ApprovalStatus.REJECTED;
        this.approvalRequestDAO.put(this);
        this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
      },
    }
  ]
});
