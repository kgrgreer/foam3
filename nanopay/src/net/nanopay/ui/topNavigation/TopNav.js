foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'TopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [
    'loginSuccess'
  ],

  requires: [
    'foam.nanos.menu.MenuBar',
    'foam.nanos.u2.navigation.BusinessLogoView',
    'net.nanopay.ui.topNavigation.UserTopNavView'
  ],

  css: `
    ^ {
      background: /*%BLACK%*/ #1e1f21;
      width: 100%;
      min-width: 992px;
      height: 60px;
      color: white;
      padding-top: 5px;
    }
    ^ .topNavContainer {
      width: 100%;
      margin: auto;
    }
    ^ .menuBar > div > ul {
      margin-top: 0;
      padding-left: 0;
      font-weight: 100;
      color: #ffffff;
    }
    ^ .foam-nanos-menu-MenuBar li {
      display: inline-block;
      cursor: pointer;
    }
    ^ .menuItem{
      display: inline-block;
      padding: 20px 0 5px 0px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .menuItem:hover, ^ .menuItem.hovered {
      cursor: pointer;
      padding-bottom: 5px;
      border-bottom: 1px solid white;
    }
    ^ .selected {
      border-bottom: 4px solid /*%PRIMARY5%*/ #e5f1fc !important;
      padding-bottom: 5px;
      text-shadow: 0 0 0px white, 0 0 0px white;
    }
    ^ .menuBar{
      width: auto;
      overflow: auto;
      white-space: nowrap;
      margin-left: 60px;
    }
  `,

  properties: [
    {
      name: 'dao',
      factory: function() { return this.menuDAO; }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('topNavContainer')
          .show(this.loginSuccess$)
          .tag(this.BusinessLogoView)
          .start(this.MenuBar)
            .addClass('menuBar')
          .end()
          .tag(this.UserTopNavView)
        .end();
    }
  ]
});
