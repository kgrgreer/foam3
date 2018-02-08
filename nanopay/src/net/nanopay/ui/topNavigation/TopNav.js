foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'TopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [ 'menuDAO', 'user', 'loginSuccess' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: %PRIMARYCOLOR%;
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
          padding: 20px 0 10px 0px;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }
        ^ .selected {
          border-bottom: 4px solid %ACCENTCOLOR%;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .menuBar{
          width: 60%;
          overflow: auto;
          white-space: nowrap;
          margin-left: 60px;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.menuDAO; }
    }
  ],

  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start().addClass('topNavContainer')
          .show( this.loginSuccess$)
          .start({class: 'net.nanopay.ui.topNavigation.BusinessLogoView', data: this.user })
          .end()
          .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
          .start({class: 'net.nanopay.ui.topNavigation.UserTopNavView'})
          .end()
        .end();
    }
  ]
});
