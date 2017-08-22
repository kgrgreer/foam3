foam.CLASS({
  package: 'net.nanopay.admin.ui.shared.topNavigation',
  name: 'TopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [ 'menuDAO' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #14375d;
          width: 100%;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 100%;
          margin: auto;
        }
        .menuBar > div > ul {
          padding-left: 0;
          font-weight: 100;
          letter-spacing: 0.2px;
          color: #ffffff;
        }
        .menuBar > div > ul > li{
          margin-left: 25px;
          display: inline-block;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }

        .menuBar > div > ul > li:hover {
          border-bottom: 4px solid #ffc92a;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
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
        .start('div').addClass('topNavContainer')
          .tag({class: 'net.nanopay.admin.ui.shared.topNavigation.BusinessLogoView', data: this.data})
          .start({class: 'foam.nanos.menu.MenuBar'})
            .addClass('menuBar')
          .end()
          .tag({class: 'net.nanopay.admin.ui.shared.topNavigation.UserTopNavView'})
        .end()
    }
  ]
});
