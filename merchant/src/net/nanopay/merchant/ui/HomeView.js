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
        ^ .amount-field {
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

        ^ .amount-field:focus {
          outline: none;
        }
      */}
    })
  ],

  properties: [
    ['header', true],
    { name: 'amount', class: 'String', value: '$5.00'}
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .on('keydown', this.onKeyPressed)
        .start().addClass('amount-label').add('Amount')
        .start('input')
          .attrs({
            value: this.amount
          })
          .addClass('amount-field')
        .end()
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      if ( e.key !== 'Enter' ) {
        return;
      }

      this.stack.push(this.QRCodeView.create({
        amount: this.amount.replace(/\$|,|\./g, '')
      }));
    }
  ]
})