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
      name: 'borderSize',
      value: '2px solid rgba(0, 0, 0, 0.06)'
    }
  ],

  css: `
    ^ {
      align-items: center;
      background-color: $topNavBackground;
      border-bottom: $borderSize;
      display: flex;
      min-height: 64px;
      justify-content: space-between;
      padding: 8px 16px;
      position: relative;
      width: 100%;
    }
    ^components-container {
      flex: 1;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
    }
    ^components-container^logo-adjust {
      gap: 16px;
    }
    ^menuControl.foam-u2-view-NavigationButton {
      justify-content: flex-start;
    }
    ^logo {
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
    }

    @media (min-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^components-container {
        display: flex;
        flex: 1;
        gap: 8px;
      }
      ^right {
        justify-content: flex-end;
      }
      ^logo {
        position: static;
        left: auto;
        transform: none;
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
        .tag({class: 'foam.nanos.se.SystemNotificationBorder'})
        .add(this.slot(function(displayWidth) {
          if ( displayWidth.ordinal >= foam.u2.layout.DisplayWidth.MD.ordinal ) {
            return this.E().addClass(this.myClass('components-container'), this.myClass('right'))
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
