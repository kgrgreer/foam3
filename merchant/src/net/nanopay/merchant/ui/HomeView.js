foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'HomeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  requires: [
    'net.nanopay.merchant.ui.QRCodeView'
  ],

  imports: [
    'stack'
  ],

  exports: [
    'as data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background-color: #2c4389;
          position: relative;
        }
        ^ .amount-label {
          height: 30px;
          font-family: Roboto;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 58px;
        }
        ^ .property-amount {
          border: none;
          background-color: #2c4389;
          height: 88px;
          width: 320px;
          max-width: 100%;
          overflow-x: hidden;
          font-family: Roboto;
          font-size: 75px;
          text-align: center;
          color: #ffffff;
          margin-top: 14px;
        }

        ^ .property-amount:focus {
          outline: none;
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    { class: 'Currency', name: 'amount' },
    { class: 'Boolean', name: 'focused', value: false }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .on('keydown', this.onKeyPressed)
        .start().addClass('amount-label')
          .add('Amount')
        .end()
        .start(this.AMOUNT, { onKey: true })
          .attrs({autofocus: true})
        .end()
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      if ( ! this.focused ) {
        this.focused = true;
        e.target.value = null;
      }

      var key = e.key || e.keyIdentifier;
      if ( key !== 'Enter' || this.amount < 1)
        return;

      // push QR code view
      this.stack.push(this.QRCodeView.create({
        amount: this.amount
      }));
    }
  ]
})