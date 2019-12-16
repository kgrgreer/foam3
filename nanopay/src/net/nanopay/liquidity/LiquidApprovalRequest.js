foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquidApprovalRequest',
  extends: 'net.nanopay.approval.ApprovalRequest',

  tableColumns: [
    'classification',
    'operation',
    'outgoingAccount',
    'initiatingUser',
    'approver',
    'status',
    'referenceObj'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  imports: [
    'stack'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      visibility: 'RO',
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      tableCellFormatter: function(approver) {
        let self = this;
        this.__subSubContext__.userDAO.find(approver).then((user)=> {
            self.add(user.toSummary());
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'outgoingAccount',
      tableCellFormatter: function(outgoingAccount) {
        let self = this;
        this.__subSubContext__.accountDAO.find(outgoingAccount).then((account)=> {
          self.add(account.toSummary())
        });
      }
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'initiatingUser',
      tableCellFormatter: function(initiatingUser) {
        let self = this;
        this.__subSubContext__.userDAO.find(initiatingUser).then((user)=> {
          self.add(user.toSummary());
        });
      }
    },
    {
      class: 'Map',
      name: 'propertiesToUpdate'
    }
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return `(${this.classification}:${this.outgoingAccount}) ${this.operation}`;
      }
    }
  ],

  actions: [
    {
      name: 'approve',
      isAvailable: (initiatingUser, approver, status) => {
          if ( 
            status === net.nanopay.approval.ApprovalStatus.REJECTED || 
            status === net.nanopay.approval.ApprovalStatus.APPROVED 
          ) {
        return false;
        }
        return initiatingUser !== approver;
      },
      code: function() {
        // TODO: CLone approvalRequest object then once it gets put you can set this as approved
        this.status = this.ApprovalStatus.APPROVED; // fixme
        this.approvalRequestDAO.put(this).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
    {
      name: 'reject',
      isAvailable: (initiatingUser, approver, status) => {
        if ( 
            status === net.nanopay.approval.ApprovalStatus.REJECTED || 
            status === net.nanopay.approval.ApprovalStatus.APPROVED 
          ) {
         return false;
        }
        return initiatingUser !== approver;
      },
      code: function() {
        this.status = this.ApprovalStatus.REJECTED;
        this.approvalRequestDAO.put(this).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.stack.back();
        }, e => {
          this.throwError.pub(e);
          this.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ]
});
