/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'showAbout',
    'toolbarIcon',
    'toolbarTitle'
  ],

  exports: [
    'as data'
  ],

  css: `
    ^ {
      width: 100%;
      background-color: /*%BLACK%*/ #1e1f21;
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
      background-color: /*%BLACK%*/ #1e1f21;
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
  `,

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
      this.showAbout = true;
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
        this.amount = '$' + (this.amountInt / 100.0).toFixed(2);
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
          this.amount = '$0.00';
        }

        var length = this.amount.length;
        if ( key === 'Backspace' || key === 8 ) {
          if ( length <= 1 ) return;
          this.amountInt = ( this.amountInt / 10.0 );
          this.amount = '$' + (this.amountInt / 100.0).toFixed(2);
          return;
        }

        if ( key === 'Enter' || key === 13 ) {
          this.onNextClicked(e);
          return;
        }

        // subtract keycode
        if ( key >= 48 && key <= 57 ) {
          key -= 48;
        }

        // check if not a number
        if ( Number.isNaN(parseInt(key, 10)) ) {
          return;
        }

        this.amountInt = (this.amountInt * 10) + parseInt(key, 10);
        this.amount = '$' + (this.amountInt / 100.0).toFixed(2);
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