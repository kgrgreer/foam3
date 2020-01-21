foam.CLASS({
  package: 'net.nanopay.liquidity.approvalRequest',
  name: 'RoleApprovalRequest',
  extends: 'net.nanopay.approval.ApprovalRequest',

  javaImports : [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.*',
    'java.util.ArrayList',
    'foam.core.FObject',
    'foam.nanos.ruler.Operations',
    'java.util.List',
    'net.nanopay.account.Account',
    'foam.nanos.logger.Logger',
    'static foam.mlang.MLang.*'
  ],

  tableColumns: [
    'classification',
    'operation',
    'initiatingUser',
    'approver',
    'status',
    'lastModified'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  imports: [
    'currentMenu',
    'stack',
    'ctrl'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  sections: [
    {
      name: '_defaultSection',
      permissionRequired: true
    },
    {
      name: 'requestDetails'
    }
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.EQ(
          net.nanopay.approval.ApprovalRequest.STATUS,
          net.nanopay.approval.ApprovalStatus.REQUESTED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Approved',
      predicateFactory: function(e) {
        return  e.EQ(
          net.nanopay.approval.ApprovalRequest.STATUS,
          net.nanopay.approval.ApprovalStatus.APPROVED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Rejected',
      predicateFactory: function(e) {
        return  e.EQ(
          net.nanopay.approval.ApprovalRequest.STATUS,
          net.nanopay.approval.ApprovalStatus.REJECTED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'All',
      predicateFactory: function(e) {
        return e.TRUE;
      }
    },
    {
      class: 'foam.comics.v2.namedViews.NamedViewCollection',
      name: 'Table',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      icon: 'images/list-view.svg',
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      section: 'requestDetails',
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
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      label: 'Action',
      section: 'requestDetails'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'initiatingUser',
      label: 'Requestor',
      tableCellFormatter: function(initiatingUser) {
        let self = this;
        this.__subSubContext__.userDAO.find(initiatingUser).then((user)=> {
          self.add(user.toSummary());
        });
      },
      section: 'requestDetails',
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      hidden: true
    },
    {
      name: 'memo',
      hidden: true
    },
  ],

  methods: [
    {
      name: 'toSummary',
      code: function() {
        return `(${this.classification}) ${this.operation}`;
      }
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      Logger logger = (Logger) x.get("logger");
      DAO dao = (DAO) x.get(getDaoKey());
      if ( dao == null ) {
        logger.error(this.getClass().getSimpleName(), "DaoKey not found", getDaoKey());
        throw new RuntimeException("Invalid dao key for the approval request object.");
      }

      if ( getOperation() != Operations.CREATE ){
        FObject obj = dao.inX(x).find(getObjId());
        if ( obj == null ) {
          logger.error(this.getClass().getSimpleName(), "ObjId not found", getObjId());
          throw new RuntimeException("Invalid object id.");
        }
      }
      `
    },
  ],

  messages: [
    {
      name: 'SUCCESS_APPROVED',
      message: 'You have successfully approved this request.'
    },
    {
      name: 'SUCCESS_REJECTED',
      message: 'You have successfully rejected this request.'
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'requestDetails',
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
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        this.approvalRequestDAO.put(approvedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_APPROVED
          }));

          if ( this.currentMenu.id !== this.stack.top[2] ) {
            this.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
    {
      name: 'reject',
      section: 'requestDetails',
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
        var rejectedApprovalRequest = this.clone();
        rejectedApprovalRequest.status = this.ApprovalStatus.REJECTED;

        this.approvalRequestDAO.put(rejectedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_REJECTED
          }));

          if ( this.currentMenu.id !== this.stack.top[2] ) {
            this.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    }
  ]
});
