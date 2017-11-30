foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'HomeView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  requires: [
    'net.nanopay.merchant.ui.QRCodeView',
    'net.nanopay.merchant.ui.ErrorMessage',
    'net.nanopay.merchant.ui.KeyboardView'
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
          width: 100%;
          background-color: %PRIMARYCOLOR%;
          position: relative;
        }
        ^ .amount-label {
          height: 30px;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 58px;
        }
        ^ .amount-field {
          border: none;
          background-color: %PRIMARYCOLOR%;
          height: 90px;
          overflow-x: hidden;
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
    { class: 'Int', name: 'amountInt', value: 0 },
    { class: 'String', name: 'amount', value: '$0.00' },
    { class: 'Boolean', name: 'focused', value: false }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'Home';
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
        .tag(this.KeyboardView.create({
          onButtonPressed: this.onButtonPressed,
          onNextClicked: this.onNextClicked
        }))

      this.onload.sub(function () {
        self.document.querySelector('.amount-field').focus();
      });
    }
  ],

  listeners: [
    function onButtonPressed (e) {
      var key = e.target.textContent;
      if ( ! this.focused ) {
        this.focused = true;
        this.amount = '$0.00';
      }

      var length = this.amount.length;
      if ( key === 'backspace' ) {
        if ( length <= 1 ) return;
        this.amountInt = ( this.amountInt / 10.0);
        this.amount = '$' + ( this.amountInt / 100.0).toFixed(2);
        return;
      }

      this.amountInt = (this.amountInt * 10) + parseInt(key, 10);
      if ( key === '00' ) {
        this.amountInt = (this.amountInt * 10) + parseInt(key, 10);
      }
      this.amount = '$' + (this.amountInt / 100.0).toFixed(2);
    },

    function onKeyPressed (e) {
      try {
        var key = e.key || e.keyCode;
        if ( ! this.focused ) {
          this.focused = true;
          this.amount = '$';
        }

        // do nothing on escape key
        if ( key === 'Escape' || key === 27 ) {
          return;
        }

        var length = this.amount.length;

        if ( key === 'Backspace' || key === 8 ) {
          if ( length <= 1 ) return;
          this.amount = this.amount.substring(0, length - 1);
          return;
        }

        var decimal = this.amount.indexOf('.');
        // handle enter key
        if ( ( key === 'Enter' || key === 13 ) ) {
          // append 0 if only one decimal digit is specified
          if ( length - decimal === 2 ) {
            this.amount += '0';
            length += 1;
          }

          // validate amount greater than 0
          var value = this.amount.replace(/\D/g, '');
          if ( value <= 0 ) {
            throw new Error('Invalid amount');
          }

          // display QR code view
          this.stack.push(this.QRCodeView.create({
            amount: ( decimal !== -1 ) ? value : value * 100
          }));
          return;
        }

        // only allow 2 decimal places
        if ( decimal !== -1 && length - decimal > 2 ) {
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
      } catch (e) {
        this.tag(this.ErrorMessage.create({ message: e.message }));
      }
    },

    function onNextClicked (e) {
      try {
        // validate amount greater than 0
        var value = this.amount.replace(/\D/g, '');
        if ( value <= 0 ) {
          throw new Error('Invalid amount');
        }

        // display QR code view
        this.stack.push(this.QRCodeView.create({
          amount: value
        }));
      } catch (e) {
        this.tag(this.ErrorMessage.create({ message: e.message }));
      }
    }
  ]
})