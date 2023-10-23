/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'ApprovalRequest',
  plural: 'Approval Requests',
  documentation: 'Approval requests are stored in approvalRequestDAO and represent a single approval request for a single user.',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.LastModifiedByAgentNameAware'
  ],

  javaImports: [
    'foam.core.X',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.*',
    'foam.nanos.logger.Logger',
    'foam.nanos.dao.Operation',
    'java.util.ArrayList',
    'java.util.List',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.approval.CustomViewReferenceApprovable',
    'foam.nanos.auth.LifecycleState',
    'foam.u2.dialog.Popup',
    'foam.u2.stack.StackBlock'
  ],

  imports: [
    'DAO approvalRequestDAO',
    'tableViewApprovalRequestDAO',
    'ctrl',
    'currentMenu',
    'notify',
    'stack',
    'subject',
    'translationService',
    'userDAO'
  ],

  searchColumns: [
    'id',
    'classification',
    'createdFor',
    'status'
  ],

  tableColumns: [
    'id',
    'referenceSummary',
    'classification',
    'createdForSummary',
    'assignedTo.legalName',
    'status',
    'memo'
  ],

  sections: [
    {
      name: 'approvalRequestInformation',
      order: 10
    },
    {
      name: 'systemInformation',
      order: 30,
      permissionRequired: true
    },
    {
      name: 'additionalInformation',
      order: 20
    }
  ],

  axioms: [
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Assigned',
      predicateFactory: function(e) {
        return e.AND(
          e.NEQ(foam.nanos.approval.ApprovalRequest.ASSIGNED_TO, 0),
          e.EQ(
            foam.nanos.approval.ApprovalRequest.ASSIGNED_TO,
            foam.nanos.approval.ApprovalRequest.APPROVER
          )
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Pending',
      predicateFactory: function(e) {
        return e.AND(
          e.EQ(
            foam.nanos.approval.ApprovalRequest.STATUS,
            foam.nanos.approval.ApprovalStatus.REQUESTED
          ),
          e.EQ(
            foam.nanos.approval.ApprovalRequest.ASSIGNED_TO,
            0
          )
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Approved',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.APPROVED
        );
      }
    },
    {
      class: 'foam.comics.v2.CannedQuery',
      label: 'Rejected',
      predicateFactory: function(e) {
        return e.EQ(
          foam.nanos.approval.ApprovalRequest.STATUS,
          foam.nanos.approval.ApprovalStatus.REJECTED
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
      class: 'String',
      name: 'referenceSummary',
      section: 'approvalRequestInformation',
      order: 21,
      gridColumns: 6,
      storageTransient: true,
      tableWidth: 250,
      visibility: 'RO',
      columnPermissionRequired: true
    },
    {
      class: 'String',
      name: 'id',
      section: 'approvalRequestInformation',
      order: 10,
      gridColumns: 6,
      visibility: 'RO',
      columnPermissionRequired: true,
      documentation: 'Approval request primary key.'
    },
    {
      class: 'Object',
      javaType: 'Object',
      name: 'objId',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 20,
      gridColumns: 6,
      columnPermissionRequired: true,
      documentation: 'id of the object that needs approval.',
      tableWidth: 150,
      javaFormatJSON: 'formatter.output(String.valueOf(get_(obj)));'
    },
    {
      class: 'Enum',
      of: 'foam.nanos.dao.Operation',
      name: 'operation',
      label: 'Action',
      includeInDigest: false,
      section: 'approvalRequestInformation',
      order: 30,
      columnPermissionRequired: true,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'group',
      documentation: `When set, each user in the group will receive a request for approval.
      If "approver" property is set, "group" property is ignored.`,
      includeInDigest: false,
      section: 'approvalRequestInformation',
      order: 50,
      columnPermissionRequired: true,
      gridColumns: 6,
      menuKeys: ['admin.groups']
    },
    {
      class: 'Enum',
      of: 'foam.nanos.approval.ApprovalStatus',
      name: 'status',
      value: 'REQUESTED',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 60,
      gridColumns: 6,
      columnPermissionRequired: true,
      javaFactory: 'return foam.nanos.approval.ApprovalStatus.REQUESTED;',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'approver',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 70,
      gridColumns: 6,
      columnPermissionRequired: true,
      documentation: `The user that is requested for approval. When set, "group" property is ignored.`,
      readVisibility: 'RO',
      createVisibility: 'HIDDEN',
      updateVisibility: 'HIDDEN'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.approval.ApprovalRequestClassification',
      name: 'classification',
      label: 'Approval Type',
      section: 'approvalRequestInformation',
      order: 80,
      gridColumns: 6,
      columnPermissionRequired: true,
      includeInDigest: true,
      tableWidth: 300,
      tableCellFormatter: { class: 'foam.u2.view.ReferenceToSummaryCellFormatter' }
    },
    // TODO: remove after migration script is run
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.approval.ApprovalRequestClassificationEnum',
      name: 'classificationEnum',
      section: 'approvalRequestInformation',
      order: 90,
      gridColumns: 6,
      columnPermissionRequired: true,
      transient: true,
      tableWidth: 300,
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'created',
      section: 'approvalRequestInformation',
      order: 100,
      gridColumns: 6,
      columnPermissionRequired: true,
      includeInDigest: true,
      visibility: function(created) {
        return created ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdFor',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 105,
      gridColumns: 6,
      columnPermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdForAgent',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order: 106,
      gridColumns: 6,
      columnPermissionRequired: true
    },
    {
      class: 'String',
      name: 'createdForSummary',
      section: 'additionalInformation',
      order: 107,
      gridColumns: 6,
      columnPermissionRequired: true,
      storageTransient: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      includeInDigest: true,
      section: 'additionalInformation',
      order: 110,
      gridColumns: 6,
      columnPermissionRequired: true,
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.userDAO
          .find(value)
          .then(user => this.add(user ? user.toSummary() : `ID: ${value}`));
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      includeInDigest: true,
      section: 'additionalInformation',
      order: 115,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      order:  120,
      gridColumns: 6,
      columnPermissionRequired: true,
      visibility: function(lastModified) {
        return lastModified ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      includeInDigest: true,
      section: 'additionalInformation',
      order: 130,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      includeInDigest: true,
      section: 'additionalInformation',
      order: 130,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true
    },
    {
      class: 'String',
      name: 'lastModifiedByAgentName',
      includeInDigest: true,
      section: 'additionalInformation',
      order: 130,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true
    },
    {
      class: 'String',
      name: 'memo',
      view: { class: 'foam.u2.tag.TextArea', rows: 3, cols: 60 },
      documentation: 'Meant to be used for explanation on why request was approved/rejected',
      includeInDigest: true,
      section: 'approvalRequestInformation',
      columnPermissionRequired: true,
      order: 135
    },
    {
      class: 'String',
      name: 'daoKey',
      section: 'systemInformation',
      order: 10,
      gridColumns: 6,
      columnPermissionRequired: true,
      documentation: `Used internally in approvalDAO to point where requested object can be found.
      Should not be used to retrieve approval requests for a given objects
      since an object can have multiple requests of different nature. When used in conjunction with serverDaoKey,
      the daoKey is mainly used for interaction on the client such as view reference and the properties to update view.`,
      includeInDigest: true,
    },
    {
      class: 'String',
      name: 'serverDaoKey',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6,
      columnPermissionRequired: true,
      documentation: `Used internally in approvalDAO if an approval request concerns both a clientDAO and
      a server side dao. The server dao key is mainly used for backend actions that get executed on
      the object as a cause of the approval request being approved or rejected.`,
      factory: function(){
        return this.daoKey;
      },
      javaFactory: `
        return getDaoKey();
      `
    },
    {
      class: 'Boolean',
      name: 'isTrackingRequest',
      includeInDigest: true,
      columnPermissionRequired: true,
      section: 'systemInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'isFulfilled',
      includeInDigest: false,
      section: 'systemInformation',
      order: 40,
      columnPermissionRequired: true,
      gridColumns: 6
    },
    {
      class: 'Int',
      name: 'points',
      documentation: `Specific to each ApprovalRequest object.
      Determines the weight of the approved request depending on the approver's role.
      Future: populated in approvalRequestDAO pipeline based on configurations.
      Currentely populated as 1.`,
      includeInDigest: false,
      section: 'systemInformation',
      order: 50,
      gridColumns: 6,
      columnPermissionRequired: true,
      visibility: function(points) {
        return points ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'requiredPoints',
      value: 1,
      includeInDigest: false,
      section: 'systemInformation',
      order: 60,
      gridColumns: 3,
      columnPermissionRequired: true,
      documentation: `Defines how many approvers required and approvers' ranks.
      E.g. when set to 10:
      1) 10 approval requests with "points" set to 1.
      2) 2 approval requests with "points" set to 3 and 1 approval request with "points" set to 5.
      etc.
      Deafults to 1 meaning only one approval of any approver rank is required by default.`,
      visibility: function(requiredPoints) {
        return requiredPoints ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Int',
      name: 'requiredRejectedPoints',
      value: 1,
      includeInDigest: false,
      columnPermissionRequired: true,
      section: 'systemInformation',
      order: 70,
      gridColumns: 3,
      visibility: function(requiredRejectedPoints) {
        return requiredRejectedPoints ?
          foam.u2.DisplayMode.RO :
          foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Object',
      name: 'refObjId',
      includeInDigest: true,
      section: 'systemInformation',
      order: 80,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: `
        ID of obj displayed in view reference
        To be used in view reference action when the approvalrequest
        needs to specify its own reference, for example in the case of
        UserCapabilityJunctions where data is null.
      `,
      expression: function(objId) {
        return objId;
      }
    },
    {
      class: 'String',
      name: 'refDaoKey',
      includeInDigest: true,
      section: 'systemInformation',
      order: 90,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true,
      writePermissionRequired: true,
      documentation: `
        Daokey of obj displayed in view reference.
        To be used in view reference action when the approvalrequest
        needs to specify its own reference, for example in the case of
        UserCapabilityJunctions where data is null.
      `,
      expression: function (daoKey) {
        return daoKey;
      }
    },
    {
      class: 'String',
      name: 'token',
      documentation: 'token in email for ‘click to approve’.',
      includeInDigest: true,
      section: 'systemInformation',
      order: 100,
      gridColumns: 6,
      columnPermissionRequired: true,
      readPermissionRequired: true,
      writePermissionRequired: true
    },
    {
      class: 'String',
      name: 'approvableHashKey',
      includeInDigest: true,
      columnPermissionRequired: true,
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo',
      section: 'approvalRequestInformation',
      columnPermissionRequired: true,
      gridColumns: 6,
      order: 70
    },
    {
      class: 'StringArray',
      name: 'additionalGroups',
      columnPermissionRequired: true,
      section: 'approvalRequestInformation',
      gridColumns: 6,
      order: 65,
      documentation: `
        Optional field to specify the request to be sent to multiple  groups.
        Should remain non-transient to handle fulfilled requests being visible to different groups.
      `
    },
    {
      class: 'Boolean',
      name: 'canRetry',
      hidden: true
    }
  ],

  messages: [
    {
      name: 'BACK_LABEL',
      message: 'Back'
    },
    {
      name: 'SUCCESS_ASSIGNED',
      message: 'You have successfully assigned this request'
    },
    {
      name: 'SUCCESS_ASSIGNED_TITLE',
      message: 'Request Assigned'
    },
    {
      name: 'SUCCESS_UNASSIGNED',
      message: 'You have successfully unassigned this request'
    },
    {
      name: 'SUCCESS_UNASSIGNED_TITLE',
      message: 'Request Unassigned'
    },
    {
      name: 'SUCCESS_APPROVED',
      message: 'You have successfully approved this request'
    },
    {
      name: 'SUCCESS_APPROVED_TITLE',
      message: 'Request Approved'
    },
    {
      name: 'SUCCESS_MEMO',
      message: 'You have successfully added a memo'
    },
    {
      name: 'SUCCESS_MEMO_TITLE',
      message: 'Memo Added'
    },
    {
      name: 'SUCCESS_REJECTED',
      message: 'You have successfully rejected this request'
    },
    {
      name: 'SUCCESS_REJECTED_TITLE',
      message: 'Request Rejected'
    },
    {
      name: 'SUCCESS_CANCELLED',
      message: 'You have successfully cancelled this request'
    },
    {
      name: 'SUCCESS_CANCELLED_TITLE',
      message: 'Request Cancelled'
    },
    {
      name: 'FAILED_RETRY',
      message: 'You have failed to retry this request'
    },
    {
      name: 'FAILED_RETRY_TITLE',
      message: 'Failed retry'
    },
    {
      name: 'ASSIGN_TITLE',
      message: 'Select an assignee'
    },
    {
      name: 'PENDING',
      message: 'Pending'
    },
    {
      name: 'TRACKING',
      message: 'Tracking'
    }
  ],

  methods: [
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

      if ( getOperation() != Operation.CREATE ){
        FObject obj = dao.inX(x).find(getObjId());
        if ( obj == null ) {
          logger.error(this.getClass().getSimpleName(), "ObjId not found", getObjId());
          throw new RuntimeException("Invalid object id.");
        }
      }
      `
    },
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.classification$find.then(classification => classification.toSummary());
      },
      javaCode: `
        return findClassification(getX()).toSummary();
      `
    },
    // TODO: remove this when we remove classificationEnum
    {
      name: 'getClassificationEnumIsSet_',
      type: 'Boolean',
      javaCode: `
        return this.classificationEnumIsSet_;
      `
    },
    {
      name: 'appendMemoReverse',
      type: 'String',
      code: function(X, memo) {
        oldMemo = this.memo;
        newMemo = memo + ' -- '
                  + X.subject.user.firstName + ' '
                  + X.subject.user.lastName + ' '
                  + (new Date()).toString()
                  + (oldMemo && '\n')
                  + oldMemo;
        return newMemo;
      }
    }
  ],

  actions: [
    {
      name: 'approve',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status, subject, assignedTo) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;

        this.approvalRequestDAO.put(approvedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_APPROVED_TITLE, this.SUCCESS_APPROVED, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'approveWithMemo',
      tableWidth: 175,
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status, subject, assignedTo) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        X.ctrl.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.MemoModal',
          onExecute: this.approveWithMemoL.bind(this, X)
        }));
      }
    },
    {
      name: 'addMemo',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        X.ctrl.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.MemoModal',
          isMemoRequired: true,
          onExecute: this.addMemoL.bind(this, X)
        }));
      }
    },
    {
      name: 'retry',
      section: 'approvalRequestInformation',
      isAvailable: async function(isTrackingRequest, status, subject, assignedTo, canRetry) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;

        return ! isTrackingRequest && canRetry;
      },
      code: async function(X) {
        const approvalRequest = this.clone();

        this.approvalRequestDAO.put(approvalRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          // Give some delay while approval request moves to the final state
          setTimeout(() => {
            this.approvalRequestDAO.find(req.id).then(req => {
              if ( req.status === this.ApprovalStatus.APPROVED ) {
                this.notify(this.SUCCESS_APPROVED_TITLE, this.SUCCESS_APPROVED, this.LogLevel.INFO, true);
              } else if ( req.status === this.ApprovalStatus.REJECTED ) {
                this.notify(this.SUCCESS_REJECTED_TITLE, this.SUCCESS_REJECTED, this.LogLevel.INFO, true);
              } else if ( req.status === this.ApprovalStatus.REQUESTED ) {
                this.notify(this.FAILED_RETRY_TITLE, this.FAILED_RETRY, this.LogLevel.ERROR, true);
              }
            });
          }, 1000);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'reject',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status, subject, assignedTo) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;
        return ! isTrackingRequest;
      },
      code: function(X) {
        X.ctrl.add(this.Popup.create({ backgroundColor: 'transparent' }).tag({
          class: 'foam.u2.MemoModal',
          onExecute: this.rejectWithMemo.bind(this, X),
          isMemoRequired: true
        }));
      }
    },
    {
      name: 'cancel',
      section: 'approvalRequestInformation',
      isAvailable: function(isTrackingRequest, status, subject, assignedTo) {
        if ( status !== this.ApprovalStatus.REQUESTED ) return false;
        if ( assignedTo !== 0 && subject.realUser.id !== assignedTo ) return false;
        return isTrackingRequest;
      },
      code: function(X) {
        var cancelledApprovalRequest = this.clone();
        cancelledApprovalRequest.status = this.ApprovalStatus.CANCELLED;

        X.approvalRequestDAO.put(cancelledApprovalRequest).then(o => {
          X.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          X.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          X.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          X.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();

          X.notify(this.SUCCESS_CANCELLED_TITLE, this.SUCCESS_CANCELLED, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'viewReference',
      section: 'approvalRequestInformation',
      isDefault: true,
      tableWidth: 150,
      isAvailable: function() {
        var self = this;

        // TODO: To consider in new approval system rework: should we allow people to view reference for a deleted or rejected object
        // since it will now just be stored in the approvable dao
        // Do not show the action if the request was reject or approved and removed
        if ( self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
            ( self.status == foam.nanos.approval.ApprovalStatus.APPROVED &&
              self.operation == foam.nanos.dao.Operation.REMOVE) ) {
             return false;
        }

        if ( self.__subContext__[self.daoKey] ) {
          var property = self.__subContext__[self.daoKey].of.ID;
          var objId = property.adapt.call(property, self.objId, self.objId, property);
          return self.__subContext__[this.daoKey]
            .find(objId)
            .then(obj => !! obj)
            .catch(err => {
              console.warn(err.message || err);
              if ( self.refObjId && self.refDaoKey && self.__subContext__[self.refDaoKey] ) {
                property = self.__subContext__[self.refDaoKey].of.ID;
                objId = property.adapt.call(property, self.refObjId, self.refObjId, property);
                return self.__subContext__[self.refDaoKey]
                  .find(objId)
                  .then(obj => !! obj)
                  .catch(err => {
                    console.warn(err.message || err);
                    return false;
                  });
              } else {
                return false;
              }
            });
        }
      },
      code: async function(X) {
        var self = this;

        // This should already be filtered out by the isAvailable, but adding here as duplicate protection
        if ( self.status == foam.nanos.approval.ApprovalStatus.REJECTED ||
           (self.status == foam.nanos.approval.ApprovalStatus.APPROVED && self.operation == foam.nanos.dao.Operation.REMOVE) ) {
             console.warn('Object is inaccessible')
             return;
        }

        // Disabled users are not authorized to access their ucjs
        let createdFor = await this.userDAO.find(this.createdFor);
        if (
          createdFor.lifecycleState === this.LifecycleState.DISABLED || ! createdFor.enabled
        ) {
          this.notify('User is disabled', '', this.LogLevel.ERROR, true);
          return;
        }

        var daoKey = self.refDaoKey;
        var property = X[daoKey].of.ID;
        var objId = property.adapt.call(property, self.refObjId, self.refObjId, property);

        var obj = await X[daoKey].find(objId);

        if ( this.CustomViewReferenceApprovable.isInstance(obj) ) {
          obj.launchViewReference(X, this);
          return;
        }

        var of = obj.cls_;
        var summaryData = obj;

        // If the dif of objects is calculated and stored in Map(obj.propertiesToUpdate),
        // this is for updating object approvals
        if ( obj.propertiesToUpdate ) {
          if ( obj.operation === foam.nanos.dao.Operation.CREATE ) {
            summaryData = obj.of.create({}, X);
            of = summaryData.cls_;

            Object.keys(obj.propertiesToUpdate).map(k => summaryData.cls_.getAxiomByName(k))
              .filter(p => p && ! p.transient && ! p.storageTransient && ! p.networkTransient)
              .forEach(p => {
                summaryData[p.name] = obj.propertiesToUpdate[p.name];
              });
            if ( obj.isUsingNestedJournal ) {
              X.stack.push(self.StackBlock.create({
                view: {
                  class: 'foam.u2.view.ViewReferenceFObjectView',
                  data: summaryData,
                  of: of
                } }));
              return;
            }
          } else {
            of = obj.of;

            // then here we created custom view to display these properties
            X.stack.push(self.StackBlock.create({
              view: {
                class: 'foam.nanos.approval.PropertiesToUpdateView',
                propObject: obj.propertiesToUpdate,
                objId: obj.objId,
                daoKey: obj.daoKey,
                of: of,
                title: 'Updated Properties and Changes'
              } }));
            return;
          }
        }

        // else pass general view with modeled data for display
        // this is for create, deleting object approvals
        X.stack.push(self.StackBlock.create({
          view: {
            class: 'foam.comics.v2.DAOSummaryView',
            data: obj,
            of: of,
            config: foam.comics.v2.DAOControllerConfig.create({
              daoKey: daoKey,
              of: of,
              editPredicate: foam.mlang.predicate.False.create(),
              createPredicate: foam.mlang.predicate.False.create(),
              deletePredicate: foam.mlang.predicate.False.create()
            }, X),
            mementoHead: null,
          },
          parent: X.createSubContext({ stack: self.stack })
        }));
      }
    },
    {
      name: 'assign',
      section: 'approvalRequestInformation',
      isAvailable: function(status){
        return status === this.ApprovalStatus.REQUESTED;
      },
      availablePermissions: [
        "approval.assign.*"
      ],
      code: function(X) {
        X.ctrl.tag({
          class: "foam.u2.PropertyModal",
          property: this.ASSIGNED_TO.clone().copyFrom({ label: '' }),
          isModalRequired: true,
          data$: X.data$,
          propertyData$: X.data.assignedTo$,
          title: this.ASSIGN_TITLE,
          onExecute: this.assignRequest.bind(this, X)
        });
      }
    },
    {
      name: 'assignToMe',
      section: 'approvalRequestInformation',
      isAvailable: function(subject, assignedTo, status){
        return (subject.user.id !== assignedTo) && (status === this.ApprovalStatus.REQUESTED);
      },
      code: function(X) {
        var assignedApprovalRequest = this.clone();
        assignedApprovalRequest.assignedTo = X.subject.user.id;

        this.approvalRequestDAO.put(assignedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_ASSIGNED_TITLE, this.SUCCESS_ASSIGNED, this.LogLevel.INFO, true);
          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'unassignMe',
      section: 'approvalRequestInformation',
      isAvailable: function(subject, assignedTo, status){
        return (subject.user.id === assignedTo) && (status === this.ApprovalStatus.REQUESTED);
      },
      code: function(X) {
        var unassignedApprovalRequest = this.clone();
        unassignedApprovalRequest.assignedTo = 0;

        this.approvalRequestDAO.put(unassignedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_UNASSIGNED_TITLE, this.SUCCESS_UNASSIGNED, this.LogLevel.INFO, true);
          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ],

  listeners: [
    {
      name: 'approveWithMemoL',
      code: function(X, memo) {
        var approvedApprovalRequest = this.clone();
        approvedApprovalRequest.status = this.ApprovalStatus.APPROVED;
        approvedApprovalRequest.memo = this.appendMemoReverse(X, memo);

        this.approvalRequestDAO.put(approvedApprovalRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_APPROVED_TITLE, this.SUCCESS_APPROVED, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'addMemoL',
      code: function(X, memo) {
        var newMemoRequest = this.clone();
        newMemoRequest.memo = this.appendMemoReverse(X, memo);
        this.approvalRequestDAO.put(newMemoRequest).then(req => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_MEMO_TITLE, this.SUCCESS_MEMO, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'rejectWithMemo',
      code: function(X, memo) {
        var rejectedApprovalRequest = this.clone();
        rejectedApprovalRequest.status = this.ApprovalStatus.REJECTED;
        rejectedApprovalRequest.memo = this.appendMemoReverse(X, memo);

        this.approvalRequestDAO.put(rejectedApprovalRequest).then(o => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_REJECTED_TITLE, this.SUCCESS_REJECTED, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, e => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'assignRequest',
      code: function(X) {
        var assignedApprovalRequest = this.clone();

        this.approvalRequestDAO.put(assignedApprovalRequest).then(_ => {
          this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
          this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
          this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);

          this.finished.pub();
          this.notify(this.SUCCESS_ASSIGNED_TITLE, this.SUCCESS_ASSIGNED, this.LogLevel.INFO, true);

          if (
            X.stack.top &&
            ( X.currentMenu.id !== X.stack.top[2] )
          ) {
            X.stack.back();
          }
        }, (e) => {
          this.throwError.pub(e);
          this.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});


foam.CLASS({
  name: 'RefineEasyCrunchWizard',
  refines: 'foam.u2.crunch.EasyCrunchWizard',

  properties: [
    {
      name: 'approval',
      class: 'FObjectProperty',
      of: 'foam.nanos.approval.ApprovalRequest'
    }
  ]
});
