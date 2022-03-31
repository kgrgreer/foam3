  /**
   * @license
   * Copyright 2018 The FOAM Authors. All Rights Reserved.
   * http://www.apache.org/licenses/LICENSE-2.0
   */

  foam.CLASS({
    package: 'foam.nanos.notification',
    name: 'NotificationRowView',
    extends: 'foam.u2.View',

    requires: [
      'foam.log.LogLevel',
      'foam.nanos.auth.User',
      'foam.nanos.notification.NotificationCitationView',
      'foam.u2.view.OverlayActionListView',
      'foam.u2.dialog.StyledModal'
    ],

    imports: [
      'myNotificationDAO',
      'notificationDAO',
      'notify',
      'stack',
      'subject',
      'userDAO',
      'ctrl'
    ],

    exports: [
      'as rowView'
    ],

    topics: [
      'finished',
      'throwError'
    ],

    css: `
      ^ {
        background: white;
        border: solid 1px #e7eaec;
        border-radius: 3px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
        cursor: pointer;
        min-height: 50px;
        padding: 8px 16px;
      }
      ^msg {
        display: -webkit-box;
        color: /*%BLACK%*/ #1e1f21;
        overflow: hidden;
        text-overflow: ellipsis;
        word-wrap: break-word;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      ^notificationDiv {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    `,

    properties: [
      {
        name: 'of',
        factory: function() {
          return this.data.cls_;
        }
      },
      'optionsBtn_',
      'optionPopup_'
    ],

    messages: [
      { name: 'MARK_AS_READ_MSG', message: 'Successfully marked as read' },
      { name: 'FAILED_MARK_AS_READ_MSG', message: 'Failed to mark as read' },
      { name: 'MARK_AS_UNREAD_MSG', message: 'Successfully marked as unread' },
      { name: 'FAILED_MARK_AS_UNREAD_MSG', message: 'Failed to mark as unread' },
      { name: 'NOTIFICATION_MSG', message: 'Notification' },
    ],

    methods: [
      function render() {
        var self = this;
        this
          .addClass(this.myClass())
          .start().addClass(this.myClass('notificationDiv'))
            .on('click', () => {
              this.openModal();
            })
            .start(this.NotificationCitationView, {
              of: this.of,
              data: this.data
            })
              .addClasses(['p', this.myClass('msg')])
            .end()
            .tag(this.OverlayActionListView, {
              data: [
                this.SHOW_DETAILS,
                this.MARK_AS_READ,
                this.MARK_AS_UNREAD,
                this.HIDE_NOTIFICATION_TYPE,
                this.REMOVE_NOTIFICATION
              ],
              obj: this.data,
              dao: this.notificationDAO,
              icon: '/images/Icon_More_Resting.svg',
              showDropdownIcon: false,
              buttonStyle: 'TERTIARY'
            })
          .end();
      }
    ],

    listeners: [
      function openModal() {
        //TODO: Mark as read?
        this.ctrl.add(this.StyledModal.create({ title: this.NOTIFICATION_MSG }).tag({
          class: 'foam.nanos.notification.NotificationMessageModal',
          data: this.data,
          of: this.of
        }));
      }
    ],

    actions: [
      {
        name: 'showDetails',
        code: function(X) {
          X.rowView.openModal();
        }
      },
      {
        name: 'removeNotification',
        code: function(X) {
          var self = X.rowView;
          X.notificationDAO.remove(self.data).then(_ => {
            self.finished.pub();
            X.myNotificationDAO.cmd(foam.dao.DAO.PURGE_CMD);
          });
        },
        confirmationRequired: function() {
          return true;
        },
      },
      function hideNotificationType(X) {
        var self = X.rowView;

        if ( self.subject.user.disabledTopics.includes(self.data.notificationType) ) {
          self.notify('Disabled already exists for this notification something went wrong.', '', self.LogLevel.ERROR, true);
          return;
        }

        var userClone = self.subject.user.clone();

        // check if disabledTopic already exists
        userClone.disabledTopics.push(self.data.notificationType);
        self.userDAO.put(userClone).then(user => {
          self.finished.pub();
          self.subject.user = user;
          X.myNotificationDAO.cmd(foam.dao.DAO.PURGE_CMD);
        }).catch(e => {
          self.throwError.pub(e);

          if ( e.exception && e.exception.userFeedback  ) {
            var currentFeedback = e.exception.userFeedback;
            while ( currentFeedback ) {
              this.ctrl.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
              currentFeedback = currentFeedback.next;
            }
          } else {
            this.ctrl.notify(e.message, '', this.LogLevel.ERROR, true);
          }
        });
      },
      {
        name: 'markAsRead',
        isAvailable: (read) => {
          return ! read;
        },
        code: function(X) {
          var self = X.rowView;
          if ( ! self.data.read ) {
            self.data.read = true;
            self.notificationDAO.put(self.data).then(_ => {
              self.finished.pub();
              self.ctrl.notify(self.MARK_AS_READ_MSG, '', this.LogLevel.INFO, true);
              X.myNotificationDAO.cmd(foam.dao.DAO.PURGE_CMD);
            }).catch((e) => {
              self.data.read = false;
              self.ctrl.notify(self.FAILED_MARK_AS_READ_MSG, e.message, this.LogLevel.ERROR, true);
            });
          }
        }
      },
      {
        name: 'markAsUnread',
        isAvailable: (read) => {
          return read;
        },
        code: function(X) {
          var self = X.rowView;
          if ( self.data.read ) {
            self.data.read = false;
            self.notificationDAO.put(self.data).then(_ => {
              self.finished.pub();
              self.ctrl.notify(self.MARK_AS_UNREAD_MSG, '', this.LogLevel.INFO, true);
              X.myNotificationDAO.cmd(foam.dao.DAO.PURGE_CMD);
            }).catch((e) => {
             self.data.read = true;
             self.ctrl.notify(self.FAILED_MARK_AS_UNREAD_MSG, e.message, this.LogLevel.ERROR, true);
           });
          }
        }
      }
    ]
  });
