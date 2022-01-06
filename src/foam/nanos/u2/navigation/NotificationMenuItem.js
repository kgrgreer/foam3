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
    ^bell {
      padding: 4px 2px;
    }
    ^bell svg {
      fill: /*%GREY2%*/ #6B778C;
    }
    ^ .dot {
      border-radius: 50%;
      display: inline-block;
      background: /*%DESTRUCTIVE3%*/ red;
      color: /*%WHITE%*/ #FFFFFF;
      width: 15px;
      height: 15px;
      position: absolute;
      right: -2px;
      top: -2px;
      display: flex;
      text-align: center;
      font-size: 0.8rem;
      align-items: center;
      justify-content: center;
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
      expression: (countUnread) => countUnread > 0
    }
  ],

  constants: [
    { name: 'BELL_IMAGE', value: 'images/bell.png' },
    { name: 'MENU_ID', value: 'notifications' }
  ],

  messages: [
    { name: 'INVALID_MENU', message: `No menu in menuDAO with id: "notifications"` }
  ],

  methods: [
    function render() {
      this.onDetach(this.myNotificationDAO.on.sub(this.onDAOUpdate));
      this.onDetach(this.subject.user$.dot('id').sub(this.onDAOUpdate));
      this.onDAOUpdate();

      this.addClass()
        .addClass('icon-container')
        .startContext({ data: this })
        .start(this.NOTIFICATIONS, { themeIcon: 'bell', label: '', buttonStyle: 'TERTIARY' })
          .addClass(this.myClass('bell'))
        .end()
        .endContext()
        .start()
          .addClass('dot')
          .add(this.countUnread$.map(v => v > 9 ? '9+' : v ))
          .show(this.showCountUnread$)
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
