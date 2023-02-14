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
    'displayWidth',
    'isMenuOpen',
    'loginSuccess',
    'menuDAO',
    'pushMenu?',
    'theme'
  ],

  cssTokens: [
    {
      name: 'topNavBackground',
      value: '$foam.nanos.menu.VerticalMenu.menuBackground'
    },
    {
      name: 'borderSizeResponsiveTopNav',
      value: '2px'
    }
  ],

  css: `
    ^ {
      align-items: center;
      background-color: $topNavBackground;
      border-bottom: $borderSizeResponsiveTopNav solid rgba(0, 0, 0, 0.06);
      display: flex;
      min-height: 64px;
      justify-content: space-between;
      padding: 8px 16px;
      position: relative;
      width: 100%;
    }
    ^components-container {
      align-items: center;
      display: flex;
      flex: 1;
      gap: 8px;
    }
    ^components-container^logo-adjust {
      gap: 16px;
    }
    ^logo {
      flex: 1;
      justify-content: center;
    }

    @media (min-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^components-container {
        flex: unset;
      }
      ^logo {
        flex: unset;
        justify-content: flex-start;
      }
    }
  `,

  properties: [
    {
      name: 'notifications'
    },
    {
      name: 'nodeName',
      value: 'header'
    }
  ],

  methods: [
    function checkNotificationAccess() {
      this.menuDAO.find('notifications').then(bb=>{
        this.notifications = bb;
      });
    },
    function render() {
      var self = this;
      this.checkNotificationAccess();
      this
        .show(this.loginSuccess$)
        .addClass(this.myClass())
        .start().addClass(this.myClass('components-container'))
          // Menu Open/Close
          .addClass(this.myClass('logo-adjust'))
          .startContext({ data: this })
            .start(this.MENU_CONTROL, { themeIcon: 'hamburger', buttonStyle: 'TERTIARY', size: 'SMALL' })
              .addClass(this.myClass('menuControl'))
            .end()
          .endContext()
          .start({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .addClass(this.myClass('logo'))
            .on('click', () => {
              this.pushMenu('', true);
            })
          .end()
        .end()
        .add(this.slot(function(displayWidth) {
          if ( displayWidth.ordinal >= foam.u2.layout.DisplayWidth.MD.ordinal ) {
            return this.E().addClass(this.myClass('components-container'))
            .add(self.slot(function(notifications) {
              if ( ! notifications ) return;
              return this.E().start(notifications, {
                label: foam.nanos.u2.navigation.NotificationMenuItem.create({}, self),
                buttonStyle: 'UNSTYLED'
              }).show(notifications).end();
            }))
            .tag({ class: 'foam.nanos.auth.LanguageChoiceView' })
            .tag({ class: 'foam.nanos.u2.navigation.UserInfoNavigationView' });
          } else {
            return this.E()
              .tag({ class: 'foam.nanos.auth.LanguageChoiceView' });
          }
        }));
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
