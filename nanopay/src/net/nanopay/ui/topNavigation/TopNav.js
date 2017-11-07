foam.CLASS({
  package: 'net.nanopay.ui.topNavigation',
  name: 'TopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar',

  imports: [ 'menuDAO', 'user' ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #093649;
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
        .menuBar > div > ul {
          padding-left: 0;
          font-weight: 100;
          color: #ffffff;
        }
        .menuItem{
          display: inline-block;
          cursor: pointer;
          border-bottom: 4px solid transparent;
          transition: text-shadow;
        }
        ^ .menuItem:hover {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .selected {
          border-bottom: 4px solid #1cc2b7;
          padding-bottom: 5px;
          text-shadow: 0 0 0px white, 0 0 0px white;
        }
        ^ .menuBar{
          width: 50%;
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
          .start({class: 'net.nanopay.ui.topNavigation.BusinessLogoView', data: this.user })
          .end()
          .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
          .start({class: 'net.nanopay.ui.topNavigation.UserTopNavView'})
          .end()
        .end()
    }
  ]
});
