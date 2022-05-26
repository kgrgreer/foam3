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
  documentation: `
    Combined AppLogo, VerticalMenu and account Navigation Components
    Can be used as the only navigation component or in conjuction with a topbar 
  `,

  imports: [
    'menuDAO'
  ],

  requires: [
    'foam.nanos.menu.VerticalMenu',
    'foam.nanos.u2.navigation.NotificationMenuItem',
    'foam.nanos.auth.LanguageChoiceView',
    'foam.nanos.u2.navigation.UserInfoNavigationView'
  ],

  cssTokens: [
    {
      name: 'bottomContainerColor',
      value: '$foam.nanos.menu.VerticalMenu.menuBackground',
      fallback: '#FFFFFF'
    }
  ],

  css: `
    ^ {
      align-items: flex-start;
      border-right: 1px solid $grey200;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%
    }
    ^sticky-container {
      align-content: flex-start;
      background: $bottomContainerColor;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 16px;
      position: sticky;
      width: 100%;
      z-index: 10;
    }
    ^bottom-container {
      bottom: 0;
    }
    ^top-container {
      top: 0;
    }
    ^divider {
      box-shadow: 0px -1px 2px rgba(0, 0, 0, 0.06), 0px -1px 3px rgba(0, 0, 0, 0.1);
    }
    ^bottom-container > * + * {
      margin-top: 4px;
    }
    ^menu-container {
      flex: 1;
    }
    ^logo {
      flex: 1;
    }
    ^menu-container.foam-nanos-menu-VerticalMenu {
      padding: 0px;
      border-right: none;
    }
    ^padding.foam-nanos-menu-VerticalMenu {
      padding-top: 16px;
    }
  `,
  properties: [
    {
      class: 'Boolean',
      name: 'hasNotifictionMenuPermission'
    },
    {
      name: 'showLogo',
      class: 'Boolean'
    }
  ],
  methods: [
    function render() {
      var self = this;
      this.checkNotificationAccess();
      this.addClass()
        .add(this.slot(function(showLogo) {
          return showLogo ? self.E().addClasses([this.myClass('sticky-container'), this.myClass('top-container')])
          .start({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .addClass(self.myClass('logo'))
            .on('click', () => {
              self.pushMenu('', true);
            })
          .end() : null;
        }))
        .start(this.VerticalMenu)
          .addClass(this.myClass('menu-container'))
          .enableClass(this.myClass('padding'), this.showLogo$.not())
        .end()
        .start()
          .addClasses([this.myClass('sticky-container'), this.myClass('bottom-container')])
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
  ]
});
