foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'TopNavigation',
  extends: 'foam.u2.Controller',

  documentation: `
    Top navigation bar displaying application and user related
    information along with personal settings menus.`,

  imports: [
    'loginSuccess'
  ],

  css: `
    ^ {
      width: 100%;
      display: flex;
      z-index: 10001;
      position: fixed;
      background-color: /*%PRIMARY1%*/ #202341;
      height: 60px;
      font-family: Roboto, Helvetica, sans-serif;
    }
    ^ .navigation-components {
      margin-right: 40px;
      display: flex;
      align-items: center;
    }
    ^ .foam-nanos-u2-navigation-ApplicationLogoView {
      margin-left: 40px;
      display: flex;
      flex-grow: 1;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice,
    ^ .net-nanopay-sme-ui-AbliiActionView-currencyChoice:hover
    {
      background: none !important;
      border: none !important;
    }
    ^ .foam-nanos-u2-navigation-NotificationMenuItem img {
      margin-top: 10px;
    }
    ^ .foam-nanos-u2-navigation-ApplicationLogoView {
      margin-left: 40px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner div {
      right: 100px;
      position: relative;
    }
    ^ .foam-nanos-menu-SubMenuView-inner {
      z-index: 10001;
      box-shadow: none;
      position: absolute;
      top: 60px;
      font-weight: 300;
      right: -100px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div {
      height: 40px;
      padding-left: 50px;
      font-size: 14px;
      font-weight: 300;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 25px;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:last-child {
      background-color: /*%GREY4%*/ #e7eaec;
      font-size: 14px;
      color: /*%BLACK%*/ black;
    }
    ^ .foam-nanos-menu-SubMenuView-inner > div:hover {
      background-color: /*%GREY5%*/ #406dea;
      cursor: pointer;
    }
    ^ .foam-nanos-menu-SubMenuView-inner::before {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border-bottom-color: white;
      -ms-transform: translate(110px, -16px);
      transform: translate(110px, -16px);
    }
    ^ .foam-nanos-menu-SubMenuView-background {
      width: 100vw;
      height: 100vh;
    }
    ^empty-nav {
      display: flex;
      align-items: center;
      margin: auto;
      color: white;
      width: 100%;
      z-index: 10001;
      position: fixed;
      background-color: /*%PRIMARY1%*/ #202341;
      height: 60px;
      justify-content: center;
      font-family: Roboto, Helvetica, sans-serif;
    }
  `,

  messages: [
    {
      name: 'GREETING',
      message: 'Welcome'
    }
  ],

  methods: [
      function initE() {
          this.start()
            .show(this.loginSuccess$)
            .addClass(this.myClass())
            .tag({ class: 'foam.nanos.u2.navigation.ApplicationLogoView' })
            .start().addClass('navigation-components')
              .tag({ class: 'net.nanopay.ui.topNavigation.CurrencyChoiceView' })
              // Hide notification icon from Top Nav for Liquid Demo
              // .tag({ class: 'foam.nanos.u2.navigation.NotificationMenuItem' })
              .tag({ class: 'foam.nanos.u2.navigation.UserInfoNavigationView' })
            .end()
          .end()
          .start().hide(this.loginSuccess$)
            .addClass(this.myClass('empty-nav'))
            .start('span').add(this.GREETING).end()
          .end()
        .end();
      }
  ]
});
