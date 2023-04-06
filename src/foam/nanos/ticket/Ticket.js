/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'Ticket',

  documentation: 'Ticket Model',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
    'foam.nanos.auth.Authorizable',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.nanos.ticket.TicketStatus',
    'foam.u2.dialog.Popup'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.util.Date'
  ],

  imports: [
    'ctrl',
    'currentMenu',
    'notify',
    'stack',
    'subject',
    'ticketDAO',
    'ticketStatusDAO',
    'userDAO',
    'ticketCommentDAO',
  ],

  tableColumns: [
    'id',
    'type',
    // REVIEW: view fails to display when owner in tableColumn, the 2nd entry in allColumns is undefined.
    // 'owner',
    'assignedToSummary',
    'createdBy.legalName',
    'lastModified',
    'status',
    'title',
    'comment',
    'dateCommented',
    'createdFor'
  ],

  searchColumns: [
    'id',
    'status',
    'created',
    'title'
  ],

  messages: [
    {
      name: 'SUCCESS_ASSIGNED',
      message: 'You have successfully assigned this ticket'
    },
    {
      name: 'SUCCESS_UNASSIGNED',
      message: 'You have successfully unassigned this ticket'
    },
    {
      name: 'SUCCESS_CLOSED',
      message: 'You have successfully closed this ticket'
    },
    {
      name: 'COMMENT_NOTIFICATION',
      message: 'A ticket assigned to you has been updated '
    }
  ],

  sections: [
    {
      name: 'infoSection',
      title: 'Ticket',
    },
    {
      name: 'metaSection',
      isAvailable: function(id) {
        return id != 0;
      },
      title: 'Audit',
    },
    {
      // NOTE: if a section is name: commentSection
      // then navigating to a comment detail view
      // does not work.
      name: '_defaultSection',
      title: 'Comments'
    },
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO',
      section: 'infoSection',
      order: 2,
      tableWidth: 100,
      gridColumns: 6
    },
    {
      name: 'type',
      class: 'String',
      visibility: 'RO',
      storageTransient: true,
      section: 'infoSection',
      getter: function() {
         return this.cls_.name;
      },
      javaGetter: `
    return getClass().getSimpleName();
      `,
      tableWidth: 160,
      order: 4,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ticket.TicketStatus',
      name: 'status',
      value: 'OPEN',
      javaFactory: 'return "OPEN";',
      includeInDigest: true,
      section: 'infoSection',
      order: 3,
      tableWidth: 130,
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.ticketStatusDAO.find(value).then(function(status) {
          if (status) {
            this.add(status.label);
          }
        }.bind(this));
      },
      view: function(_, x) {
        return {
          class: 'foam.u2.view.ModeAltView',
          readView: {
            class: 'foam.u2.view.ReferenceView',
            of: 'foam.nanos.ticket.TicketStatus'
          },
          writeView: {
            class: 'foam.u2.view.ChoiceView',
            choices: x.data.statusChoices
          }
        };
      },
      gridColumns: 6
    },
    {
      name: 'statusChoices',
      hidden: true,
      factory: function() {
        var s = [];
        if ( 'CLOSED' == this.status ) {
          s.push(['CLOSED', 'CLOSED']);
        } else {
          s.push(this.status);
          s.push(['CLOSED', 'CLOSED']);
        }
        return s;
      },
      documentation: 'Returns available statuses for each ticket depending on current status'
    },
    // REVIEW: can't get this to work.
    // {
    //   name: 'watchers',
    //   class: 'List',
    //   javaType: 'java.util.ArrayList<java.lang.Long>',
    //   view: {
    //     class: 'foam.u2.view.ReferenceArrayView',
    //     daoKey: 'userDAO'
    //   },
    //   section: 'metaSection',
    // },
    {
      class: 'String',
      name: 'title',
      // REVIEW: required causing issues for extended classes - 'Save' is never enabled.
      // required: true,
      tableWidth: 250,
      section: 'infoSection',
      validationPredicates: [
        {
          args: ['title', 'type'],
          query: 'title!=""',
          errorString: 'Please provide a summary of the Ticket.'
        }
      ],
      order: 1
    },
    {
      class: 'String',
      name: 'comment',
      value: '',
      storageTransient: true,
      section: 'infoSection',
      readVisibility: 'HIDDEN',
      validationPredicates: [
        {
          args: ['id', 'title', 'comment', 'externalComment'],
          query: 'id==0&&title!=""||comment!=""||externalComment!=""',
          errorString: 'Please provide a comment.'
        }
      ],
      projectionSafe: false,
      tableCellFormatter: function(_, obj) {
        obj.ticketCommentDAO
          .where(obj.EQ(foam.nanos.ticket.TicketComment.TICKET, obj.id))
          .orderBy(obj.DESC(foam.nanos.ticket.TicketComment.CREATED))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.ticket.TicketComment.COMMENT))
          .then(function(comment) {
            if ( comment ) {
              this.add(comment.projection);
            }
          }.bind(this));
      },
      order: 9
    },
    {
      class: 'String',
      name: 'dateCommented',
      value: '',
      storageTransient: true,
      visibility: 'RO',
      section: 'infoSection',
      projectionSafe: false,
      tableCellFormatter: function(_, obj) {
        obj.ticketCommentDAO
          .where(obj.EQ(foam.nanos.ticket.TicketComment.TICKET, obj.id))
          .orderBy(obj.DESC(foam.nanos.ticket.TicketComment.CREATED))
          .limit(1)
          .select(obj.PROJECTION(foam.nanos.ticket.TicketComment.CREATED))
          .then(function(comment) {
            if ( comment ) {
              this.add(comment.projection);
            }
          }.bind(this));
      },
      order: 10
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      includeInDigest: true,
      section: 'metaSection',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      visibility: 'RO',
      includeInDigest: true,
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      visibility: 'RO',
      includeInDigest: true,
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection',
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      visibility: 'RO',
      section: 'metaSection',
      tableWidth: 150
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      visibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      visibility: 'RO',
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      },
      section: 'metaSection',
    },
    {
      name: 'summary',
      class: 'String',
      transient: true,
      hidden: true,
      projectionSafe: false,
      tableCellFormatter: function(value, obj) {
        this.add(obj.title);
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      includeInDigest: true,
      section: 'systemInformation',
      writePermissionRequired: true,
      documentation: `
        Need to override getter to return "" because its trying to
        return null which breaks tests
      `,
      javaGetter: `
        if ( ! spidIsSet_ ) {
          return "";
        }
        return spid_;
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'assignedTo',
      section: 'infoSection',
      postSet: function(_, n) {
        if ( n != 0 ) {
          this.assignedToGroup = '';
        }
      },
      javaPostSet: `
        DAO userDAO = (DAO) foam.core.XLocator.get().get("localUserDAO");
        if ( userDAO != null ) {
          User user = (User) userDAO.find(val);
          if ( user != null ) {
            clearAssignedToSummary();
            setAssignedToSummary(user.getLegalName());
          }
        }
      `,
      order: 7,
      gridColumns: 6
    },
    {
      class: 'String',
      label: 'Assigned To',
      name: 'assignedToSummary',
      storageTransient: true,
      createVisibility: 'HIDDEN',
      visibility: 'RO',
      javaGetter: `
        DAO userDAO = (DAO) foam.core.XLocator.get().get("localUserDAO");
        if ( userDAO != null ) {
          User user = (User) userDAO.find(getAssignedTo());
          if ( user != null ) {
            return user.getLegalName();
          }
        }
        return null;
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Group',
      name: 'assignedToGroup',
      section: 'infoSection',
      postSet: function(_, n) {
        if ( n !== '' ) {
          this.assignedTo = 0;
        }
      },
      order: 8,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdFor',
      documentation: 'User/business this ticket was created for.',
      section: 'infoSection',
      readVisibility: 'RO',
      updateVisibility: 'RO',
      order: 6,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'externalComment',
      storageTransient: true,
      section: 'infoSection',
      readVisibility: 'HIDDEN',
      validationPredicates: [
        {
          args: ['id', 'title', 'comment', 'externalComment'],
          query: 'id==0&&title!=""||comment!=""||externalComment!=""',
          errorString: 'Please provide a comment.'
        }
      ],
      order: 10
    }
  ],

  methods: [
    {
      name: 'createExternalCommentNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'Ticket' }
      ],
      javaCode: `
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        Subject subject = (Subject) x.get("subject");
        if (subject.getUser().getId() == getCreatedFor()) {
          if ( getAssignedTo() != 0 ) {
            Notification notification = new TicketNotification.Builder(x)
              .setBody(this.COMMENT_NOTIFICATION+this.getId())
              .setUserId(getAssignedTo())
              .setSpid(getSpid())
              .setTicket(this.getId())
              .build();
            try {
              findAssignedTo(new Session.Builder(x).setUserId(getAssignedTo()).build().applyTo(x)).doNotify(x, notification);
            } catch (NullPointerException e) {
              notificationDAO.put_(x, notification);
            }
          } else if ( ! SafetyUtil.isEmpty(getAssignedToGroup()) ){
            Notification notification = new TicketNotification.Builder(x)
              .setBody(this.COMMENT_NOTIFICATION+this.getId())
              .setGroupId(getAssignedToGroup())
              .setSpid(getSpid())
              .setTicket(this.getId())
              .build();
            notificationDAO.put(notification);
          }
        } else if ( getCreatedFor() != 0 ){
          Notification notification = new TicketNotification.Builder(x)
            .setBody(this.COMMENT_NOTIFICATION+this.getId())
            .setUserId(getCreatedFor())
            .setSpid(getSpid())
            .setTicket(this.getId())
            .build();
          try {
            findAssignedTo(new Session.Builder(x).setUserId(getCreatedFor()).build().applyTo(x)).doNotify(x, notification);
          } catch (NullPointerException e) {
            notificationDAO.put_(x, notification);
          }
        }
      `
    },
    {
      name: 'createCommentNotification',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'old', type: 'Ticket' }
      ],
      javaCode: `
        DAO notificationDAO = (DAO) x.get("localNotificationDAO");
        if ( getAssignedTo() != 0 ) {
          Notification notification = new TicketNotification.Builder(x)
            .setBody(this.COMMENT_NOTIFICATION)
            .setUserId(getAssignedTo())
            .setSpid(getSpid())
            .setTicket(this.getId())
            .build();
          try {
            findAssignedTo(new Session.Builder(x).setUserId(getAssignedTo()).build().applyTo(x)).doNotify(x, notification);
          } catch (NullPointerException e) {
            notificationDAO.put_(x, notification);
          }
        } else if ( ! SafetyUtil.isEmpty(getAssignedToGroup()) ){
          Notification notification = new TicketNotification.Builder(x)
            .setBody(this.COMMENT_NOTIFICATION)
            .setGroupId(getAssignedToGroup())
            .setSpid(getSpid())
            .setTicket(this.getId())
            .build();
          notificationDAO.put(notification);
        }
      `
    },
    {
      name: 'authorizeOnCreate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // Everyone can create a ticket
      `
    },
    {
      name: 'authorizeOnRead',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();

        if ( user.getId() != this.getCreatedBy() && user.getId() != this.getAssignedTo() && ! auth.check(x, "ticket.read." + this.getId()) ) {
          throw new AuthorizationException("You don't have permission to read this ticket.");
        }
      `
    },
    {
      name: 'authorizeOnUpdate',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        Subject subject = (Subject) x.get("subject");
        User user = subject.getRealUser();

        // The creator of the ticket can update
        if ( user.getId() == this.getCreatedBy() ) return;

        // The assignee of the ticket can update
        Ticket oldTicket = (Ticket) ((DAO) x.get("localTicketDAO")).find(this.getId());
        if ( user.getId() == this.getAssignedTo() || user.getId() == oldTicket.getAssignedTo() ) return;

        // Group with update permission can update
        if ( auth.check(x, "ticket.update." + this.getId()) ) return;

        throw new AuthorizationException();
      `
    },
    {
      name: 'authorizeOnDelete',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaThrows: ['AuthorizationException'],
      javaCode: `
        // The checkGlobalRemove has checked the permission for deleting the ticket already.
      `
    }
  ],

  actions: [
    {
      name: 'assign',
      section: 'infoSection',
      isAvailable: function(status){
        return status === 'CLOSED';
      },
      availablePermissions: [
        "ticket.assign.*"
      ],
      code: function(X) {
        X.ctrl.tag({
          class: "foam.u2.PropertyModal",
          property: this.ASSIGNED_TO.clone().copyFrom({ label: '' }),
          isModalRequired: true,
          data$: X.data$,
          propertyData$: X.data.assignedTo$,
          title: this.ASSIGN_TITLE,
          onExecute: this.assignTicket.bind(this, X)
        });
      }
    },
    {
      name: 'assignToMe',
      section: 'infoSection',
      isAvailable: function(subject, assignedTo, status){
        return (subject.user.id !== assignedTo) && (status === 'OPEN');
      },
      code: function(X) {
        var assignedTicket = this.clone();
        assignedTicket.assignedTo = X.subject.user.id;

        this.ticketDAO.put(assignedTicket).then(req => {
          this.ticketDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.ticketDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_ASSIGNED, '', this.LogLevel.INFO, true);
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
      section: 'infoSection',
      isAvailable: function(subject, assignedTo, status){
        return (subject.user.id === assignedTo) && (status === 'OPEN');
      },
      code: function(X) {
        var unassignedTicket = this.clone();
        unassignedTicket.assignedTo = 0;

        this.ticketDAO.put(unassignedTicket).then(req => {
          this.ticketDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.ticketDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_UNASSIGNED, '', this.LogLevel.INFO, true);
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
      name: 'close',
      tableWidth: 70,
      section: 'infoSection',
      confirmationRequired: function() {
        return true;
      },
      isAvailable: function(status, id) {
        return id && status !== 'CLOSED';
      },
      code: function() {
        this.status = 'CLOSED';
        this.assignedTo = 0;
        this.ticketDAO.put(this).then(function(ticket) {
          this.copyFrom(ticket);
          this.notify(this.SUCCESS_CLOSED, '', this.LogLevel.INFO, true);
        }.bind(this));
      }
    }
  ],

  listeners: [
    {
      name: 'assignTicket',
      code: function(X) {
        var assignedTicket = this.clone();

        this.ticketDAO.put(assignedTicket).then(_ => {
          this.ticketDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          this.notify(this.SUCCESS_ASSIGNED, '', this.LogLevel.INFO, true);

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
