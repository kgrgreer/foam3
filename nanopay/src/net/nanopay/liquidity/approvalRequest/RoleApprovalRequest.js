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
    'ctrl',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
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
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      view: function(_, X) {
        if ( X.data.status === net.nanopay.approval.ApprovalStatus.REQUESTED ) {
          return {
            class: 'foam.u2.view.ValueView',
            data$: X.data$.map((data) => data.APPROVER_PENDING)
          };
        } else {
          return { class: 'foam.u2.view.ReferencePropertyView' };
        }
      },
      tableCellFormatter: function(approver, data) {
        let self = this;
        // If request is REQUESTED, show as Pending
        // Otherwise, show approver's name
        if ( data.status === net.nanopay.approval.ApprovalStatus.REQUESTED ) {
          this.add(data.APPROVER_PENDING);
        } else {
          this.__subSubContext__.userDAO.find(approver).then(user => {
            self.add(user ? user.toSummary() : `User #${approver}`);
          });
        }
      },
      visibilityExpression: function(status) {
        if ( status === net.nanopay.approval.ApprovalStatus.REQUESTED ) {
          return foam.u2.Visibility.HIDDEN;
        }

        return foam.u2.Visibility.RO;
      }
    },
    {
      class: 'String',
      name: 'pendingApproval',
      label: 'Approver',
      section: 'requestDetails',
      transient: true,
      value: 'Pending',
      visibilityExpression: function(status) {
        if ( status === net.nanopay.approval.ApprovalStatus.REQUESTED ) {
          return foam.u2.Visibility.RO;
        }
        return foam.u2.Visibility.HIDDEN;
      },
      documentation: `
        This string will be used to show that the approver is pending without
        altering the value of Approver. It is also transient.
      `
    },
    {
      class: 'Enum',
      of: 'foam.nanos.ruler.Operations',
      name: 'operation',
      label: 'Action',
      section: 'requestDetails',
      visibilityExpression: function(operation) {
        return operation ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'initiatingUser',
      label: 'Requestor',
      tableCellFormatter: function(initiatingUser) {
        let self = this;
        this.__subSubContext__.userDAO.find(initiatingUser).then(user => {
          self.add(user ? user.toSummary() : `User #${initiatingUser}`);
        });
      },
      section: 'requestDetails',
      visibilityExpression: function(initiatingUser) {
        return initiatingUser ?
          foam.u2.Visibility.RO :
          foam.u2.Visibility.HIDDEN;
      }
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      visibility: 'HIDDEN'
    }
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
    },
    {
      name: 'APPROVER_PENDING',
      message: 'Pending'
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'requestDetails',
      isAvailable: (initiatingUser, user, status) => {
        if (
          status === net.nanopay.approval.ApprovalStatus.REJECTED ||
          status === net.nanopay.approval.ApprovalStatus.APPROVED
        ) {
          return false;
        }
        return initiatingUser !== user.id;
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
      isAvailable: (initiatingUser, user, status) => {
        if (
            status === net.nanopay.approval.ApprovalStatus.REJECTED ||
            status === net.nanopay.approval.ApprovalStatus.APPROVED
          ) {
         return false;
        }
        return initiatingUser !== user.id;
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
