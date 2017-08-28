foam.CLASS({
  package: 'net.nanopay.retail.ui.shared.topNavigation',
  name: 'NoMenuTopNav',
  extends: 'foam.u2.View',

  documentation: 'Top navigation bar with no menu',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          background: #093649;
          width: 100%;
          height: 60px;
          color: white;
          padding-top: 5px;
        }
        ^ .topNavContainer {
          width: 100%;
          margin: auto;
        }
        ^ h1{
          text-align: center;
          font-weight: 100;
          font-size: 20px;
        }

      */}
    })
  ],



  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start('div').addClass('topNavContainer')
          .start('h1').add('Retail Portal').end()
          // Testing Purposes
          // .start({class: 'foam.nanos.menu.MenuBar'}).addClass('menuBar')
          .end()
        .end()
    }
  ]
});
