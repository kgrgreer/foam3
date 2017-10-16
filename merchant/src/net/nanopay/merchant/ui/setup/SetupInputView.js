foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupInputView',
  extends: 'foam.u2.Element',

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
          left: 25px;
        }
        ^ h4{
          width: 259px;
          font-weight: 300;
          text-align: center;
          margin: auto;
          margin-top: 90px;
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
        .tag({ class: 'net.nanopay.merchant.ui.BackElement'})        
        .start('h4')
          .add('Enter the code showed in retail portal to finish provision.')
        .end();
    }
  ],

});