/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
*/
foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'NotificationMenuItem',
  extends: 'foam.u2.View',

  documentation: `Notification bell icon displaying number of unread notifications
      along with redirect to notification view when clicked.`,

  requires: [
    'foam.nanos.auth.Group',
    'foam.nanos.menu.Menu',
    'foam.nanos.notification.Notification'
  ],

  imports: [
    'currentMenu',
    'menuDAO',
    'myNotificationDAO',
    'pushMenu',
    'subject'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ {
      display: flex;
      align-items: normal;
      position: relative;
    }
    ^bell.foam-u2-ActionView {
      color: $grey500;
      justify-content: flex-start;
    }
    ^bell.foam-u2-ActionView svg {
      fill: $grey500;
    }
    ^ .dot {
      align-items: center;
      background: /*%DESTRUCTIVE3%*/ red;
      border-radius: 50%;
      color: /*%WHITE%*/ #FFFFFF;
      display: flex;
      font-size: 0.8rem;
      height: 15px;
      justify-content: center;
      position: absolute;
      right: 0px;
      top: 0px;
      text-align: center;
      width: 15px;
    }
  `,

  properties: [
    {
      class: 'Int',
      name: 'countUnread'
    },
    {
      class: 'Boolean',
      name: 'showCountUnread',
      expression: function(countUnread) { countUnread > 0 }
    },
    {
      class: 'Boolean',
      name: 'showText'
    },
    {
      class: 'String',
      name: 'formattedCount',
      expression: function(countUnread) {
        return countUnread > 9 ? '9+' : countUnread;
      }
    }
  ],

  constants: [
    { name: 'BELL_IMAGE', value: 'images/bell.png' },
    { name: 'MENU_ID',    value: 'notifications' }
  ],

  messages: [
    { name: 'INVALID_MENU', message: `No menu in menuDAO with id: "notifications"` },
    { name: 'NOTIF', message: 'Notifications' }
  ],

  methods: [
    function render() {
      this.onDetach(this.myNotificationDAO.on.sub(this.onDAOUpdate));
      this.onDetach(this.subject.user$.dot('id').sub(this.onDAOUpdate));
      this.onDAOUpdate();
      var self = this;
      this.addClass()
        .addClass('icon-container')
        .startContext({ data: this })
        .start(this.NOTIFICATIONS, {
          themeIcon: 'bell',
          label$: this.showText ? this.formattedCount$.map(v => `${self.NOTIF} (${v})`) : foam.core.ConstantSlot.create({ value: '' }),
          buttonStyle: 'UNSTYLED',
          size: this.showText ? 'SMALL' : 'MEDIUM'
        })
          .addClass(this.myClass('bell'))
        .end()
        .endContext()
        .start()
          .addClass('dot')
          .add(this.countUnread$.map(v => v > 9 ? '9+' : v ))
          .show(this.slot(function(showCountUnread, showText) { return showCountUnread && ! showText; }))
        .end()
      .end();
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function() {
        if ( ! this.subject.user ) return;

        this.myNotificationDAO.where(
          this.AND(
            this.EQ(this.Notification.READ, false),
            this.EQ(this.Notification.TRANSIENT, false),
            this.NOT(this.IN(
              this.Notification.NOTIFICATION_TYPE,
              this.subject.user.disabledTopics))
          )
        ).select(this.COUNT()).then((count) => {
          this.countUnread = count.value;
        });
      }
    }
  ],

  actions: [
    {
      name: 'notifications',
      code: function() {
        this.pushMenu(this.MENU_ID);
      }
    }
  ]
});
