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
      'foam.u2.dialog.Popup'
    ],

    imports: [
      'myNotificationDAO',
      'notificationDAO',
      'notify',
      'stack',
      'user',
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
        position: relative;
        padding: 8px;
        margin-right: 32px;
      }
      ^ .foam-u2-view-OverlayActionListView {
        position: absolute;
        top: 20px;
        right: 8px;
      }
      ^ i {
        margin-top: 5px;
      }
      ^ .msg {
        font-size: 1.2rem;
        word-wrap: break-word;
        line-height: 1.4;
        width: 414px;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        display: -webkit-box;
        text-overflow: ellipsis;
        margin-right: 16px;
        overflow: hidden;
        color: /*%BLACK%*/ #1e1f21;
      }
      ^ .msg.fully-visible {
        display: block;
      }
      ^ .notificationDiv {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
    `,

    properties: [
      'of',
      'optionsBtn_',
      'optionPopup_'
    ],

    messages: [
      { name:'MARK_AS_READ_MSG', message: 'Successfully marked as read' },
      { name:'FAILED_MARK_AS_READ_MSG', message: 'Failed to mark as read' },
      { name:'MARK_AS_UNREAD_MSG', message: 'Successfully marked as unread' },
      { name:'FAILED_MARK_AS_UNREAD_MSG', message: 'Failed to mark as unread' }
    ],

    methods: [
      function render() {
        var self = this;
        this
          .addClass(this.myClass())
          .start().addClass('notificationDiv')
            .on('dblclick', function() {
              self.ctrl.add(self.Popup.create().tag({
                class: 'foam.nanos.notification.NotificationMessageModal',
                data: self.data
              }));
            })
            .tag(this.NotificationCitationView, {
              of: this.data.cls_,
              data: this.data
            })
            .tag(this.OverlayActionListView, {
              data: [
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

    actions: [
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

        if ( self.user.disabledTopics.includes(self.data.notificationType) ) {
          self.notify('Disabled already exists for this notification something went wrong.', '', self.LogLevel.ERROR, true);
          return;
        }

        var userClone = self.user.clone();

        // check if disabledTopic already exists
        userClone.disabledTopics.push(self.data.notificationType);
        self.userDAO.put(userClone).then(user => {
          self.finished.pub();
          self.user = user;
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
        })
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
