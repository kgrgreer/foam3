/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'ResponsiveTopNav',
  extends: 'foam.u2.View',

  documentation: 'FOAM Responsive Top Nav',

  imports: [
    'loginSuccess',
    'theme',
    'isMenuOpen',
    'pushMenu?',
    'menuDAO'
  ],

  css: `
    ^ {
      align-items: center;
      background-color: /*%WHITE%*/ #FFFFFF;
      display: flex;
      height: var(--topbar-height, 64px);
      justify-content: space-between;
      padding: 8px 16px;
      width: 100%;
      border-bottom: 2px solid rgba(0, 0, 0, 0.06);
    }
    ^components-container {
      display: flex;
      align-items: center;
    }
    ^components-container > * + * {
      margin-left: 8px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hasNotifictionMenuPermission'
    },
    {
      name: 'nodeName',
      value: 'header'
    }
  ],

  methods: [
    function checkNotificationAccess() {
      this.menuDAO.find('notifications').then(bb=>{
        this.hasNotifictionMenuPermission = bb;
      });
    },
    function render() {
      this.checkNotificationAccess();
      this
        .show(this.loginSuccess$)
        .addClass(this.myClass())
        .start().addClass(this.myClass('components-container'))
          // Menu Open/Close
          .startContext({ data: this })
            .tag(this.MENU_CONTROL, { themeIcon: 'hamburger', buttonStyle: 'TERTIARY', size: 'SMALL' })
          .endContext()
          .start({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .on('click', () => {
              this.pushMenu(this.theme.logoRedirect, true);
            })
          .end()
        .end()
        // TODO: Make Responsive
        .start().addClass(this.myClass('components-container'))
          .start({ class: 'foam.nanos.u2.navigation.NotificationMenuItem' })
            .show(this.hasNotifictionMenuPermission$)
          .end()
          .tag({ class: 'foam.nanos.auth.LanguageChoiceView' })
          .tag({ class: 'foam.nanos.u2.navigation.UserInfoNavigationView' })
        .end();
    }
  ],

  actions: [
    {
      name: 'menuControl',
      label: '',
      ariaLabel: 'Open/Close Menu',
      code: function() {
        this.isMenuOpen = ! this.isMenuOpen;
      }
    }
  ]
});
