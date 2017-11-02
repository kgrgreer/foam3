foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'HomeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  requires: [
    'net.nanopay.merchant.ui.QRCodeView'
  ],

  imports: [
    'stack',
    'toolbarIcon',
    'toolbarTitle'
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
          width: 320px;
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
          height: 90px;
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
    { class: 'String', name: 'amount', value: '$0.00' },
    { class: 'Boolean', name: 'focused', value: false }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'MintChip Home';
      this.toolbarIcon = 'menu';

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start().addClass('amount-label')
          .add('Amount')
        .end()
        .start('div').addClass('amount-field')
          .attrs({ autofocus: true, tabindex: 1 })
          .add(this.amount$)
        .end()

      this.onload.sub(function () {
        self.document.querySelector('.amount-field').focus();
      });
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( ! this.focused ) {
        this.focused = true;
        this.amount = '$';
      }

      // do nothing on escape key
      if ( key === 'Escape' || key === 27 ) {
        return;
      }

      // handle enter key
      if ( ( key === 'Enter' || key === 13 ) ) {
        // validate amount greater than 0
        var hasDecimal = ( this.amount.indexOf('.') !== -1 );
        var value = this.amount.replace(/\D/g, '');
        if ( value <= 0 ) {
          return;
        }

        // display QR code view
        this.stack.push(this.QRCodeView.create({
          amount: ( hasDecimal ) ? value : value * 100
        }));
        return;
      }

      var length = this.amount.length;
      if ( key === 'Backspace' || key === 8 ) {
        if ( length <= 1 ) return;
        this.amount = this.amount.substring(0, length - 1);
        return;
      }

      // if handling keycodes 0-9, subtract 48
      if ( key >= 48 && key <= 57 ) {
        key -= 48;
      }

      // convert keycode 190 to period
      if ( key === 190 ) {
        key = '.';
      }

      // prevent adding of more than one period
      if ( ( key === '.' ) && ( this.amount.indexOf('.') !== -1 || length === 1 ) ) {
        return;
      }

      // check if numeric
      var isNumeric = ( ! isNaN(parseFloat(key)) && isFinite(key) );
      if ( isNumeric || key === '.' ) {
        this.amount += key;
      }
    }
  ]
})