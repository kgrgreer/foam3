/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  // Find a better name
  name: 'ApplicationSideNav',
  extends: 'foam.u2.View',
  documentation: 'Combined VerticalMenu and account Navigation Components, to be used for mobile displays',

  imports: [
    'menuDAO'
  ],

  requires: [
    'foam.nanos.menu.VerticalMenu',
    'foam.nanos.u2.navigation.NotificationMenuItem',
    'foam.nanos.auth.LanguageChoiceView',
    'foam.nanos.u2.navigation.UserInfoNavigationView'
  ],

  css: `
    ^ {
      align-items: flex-start;
      border-right: 1px solid /*%GREY4%*/ #DADDE2;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    ^bottom-container {
      z-index: 10;
      background: white;
      position: sticky;
      bottom: 0;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-content: flex-start;
      justify-content: center;
      padding: 16px;
    }
    ^divider {
      border-top: 2px solid /*%GREY4%*/;
      box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.06), 0px -1px 3px rgba(0, 0, 0, 0.1);
    }
    ^bottom-container > * + * {
      margin-top: 4px;
    }
    ^menu-container {
      flex: 1;
    }
    ^menu-container.foam-nanos-menu-VerticalMenu {
      border-right: none;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'hasNotifictionMenuPermission'
    }
  ],
  methods: [
    function render() {
      this.checkNotificationAccess();
      this.addClass()
        .start(this.VerticalMenu)
          .on('scroll', this.scrollCheck)
          .addClass(this.myClass('menu-container'))
        .end()
        .start()
          .addClass(this.myClass('bottom-container'))
          // TODO: make this enableClass based on scroll pos
          .addClass(this.myClass('divider'))
          .start(this.NotificationMenuItem, { showText: true })
            .show(this.hasNotifictionMenuPermission$)
          .end()
          .tag(this.LanguageChoiceView, { longName: true })
          .tag(this.UserInfoNavigationView, { horizontal: true })
        .end();
    },
    function checkNotificationAccess() {
      this.menuDAO.find('notifications').then(bb=>{
        this.hasNotifictionMenuPermission = bb;
      });
    }
  ],
  listeners: [
    {
      name: 'scrollCheck',
      code: function(e) {
        debugger;
      }
    }
  ]
});
