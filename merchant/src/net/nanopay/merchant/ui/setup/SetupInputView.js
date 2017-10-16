foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  imports: [
    'device',
    'stack',
    'deviceDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .net-nanopay-merchant-ui-BackElement{
          position: relative;
          bottom: 50px;
          left: 25px;
        }
      */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div')
          .tag({ class: 'net.nanopay.merchant.ui.BackElement'})
        .end();
    }
  ],

});