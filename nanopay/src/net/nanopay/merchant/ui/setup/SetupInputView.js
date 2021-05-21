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
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupInputView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.merchant.ui.ErrorMessage',
    'net.nanopay.merchant.ui.KeyboardView',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus'
  ],

  imports: [
    'user',
    'stack',
    'device',
    'password',
    'loginSuccess',
    'deviceAuth',
    'deviceDAO',
    'serialNumber',
    'toolbarIcon',
    'toolbarTitle',
    'showAbout'
  ],

  css: `
    ^ {
      background: /*%BLACK%*/ #1e1f21;
    }
    ^ h4{
      width: 259px;
      font-weight: 300;
      text-align: center;
      margin: auto;
      margin-top: 95px;
    }
    ^ .retail-code-wrapper {
      width: 100%;
      margin-left: 10px;
    }
    ^ .retail-code {
      margin: 0 auto;
      margin-top: 50px;
      width: 212px;
      border: none;
      background:
        repeating-linear-gradient(90deg,
            white 0,
            white 2.5ch,
            transparent 0,
            transparent 4.5ch)
          0 100%/100% 2px no-repeat;
    }
    ^ .retail-code:focus {
      outline: none;
    }
    ^ .retail-code span {
      width: 320px;
      height: 44px;
      background: none;
      color: white;
      border: none;
      letter-spacing: 16px;
      font: 4.4ch Roboto, monospace;
    }
    ^ .retail-code span:empty:before {
      content: "\x20\x0B";
    }
    ^ input:focus{
      outline: none;
      color: transparent;
      text-shadow: 0px 0px 0px white;
    }
  `,

  properties: [
    ['header', true],
    { class: 'Boolean', name: 'focused', value: false }
  ],

  methods: [

    function initE() {
      this.SUPER();
      var self = this;
      this.showAbout = false;
      this.toolbarIcon = 'arrow_back';
      this.toolbarTitle = 'Back';

      this.document.addEventListener('keydown', this.onKeyPressed);
      this.onDetach(function () {
        self.document.removeEventListener('keydown', self.onKeyPressed);
      });

      this
        .addClass(this.myClass())
        .start('h4')
          .add('Enter the code showed in retail portal to finish provision.')
        .end()
        .start('div').addClass('retail-code-wrapper')
          .start('div').addClass('retail-code')
            .attrs({ autofocus: true, tabindex: 1 })
            .add(this.password$)
          .end()
        .end()
        .tag(this.KeyboardView.create({
          show00: false,
          onButtonPressed: this.onButtonPressed,
          onNextClicked: this.onNextClicked
        }));
    }
  ],

  listeners: [
    function onButtonPressed (e) {
      var key = e.target.textContent;

      var length = this.password.length;
      if ( key === 'backspace' ) {
        if ( length <= 0 ) return;
        this.password = this.password.substring(0, length - 1);
        return;
      }

      if ( length >= 6 ) {
        e.preventDefault();
        return;
      }

      this.password += key;
    },

    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( ! this.focused ) {
        this.password = '';
        this.focused = true;
      }

      // handle escape key
      if ( key === 'Escape' || key === 27 ) {
        this.stack.back();
        return;
      }

      // handle enter key
      if ( ( key === 'Enter' || key === 13 ) ) {
        this.onNextClicked(e);
        return;
      }

      var length = this.password.length;
      // handle backspace
      if ( key === 'Backspace' || key === 8 ) {
        if ( length <= 0 ) return;
        this.password = this.password.substring(0, length - 1);
        return;
      }

      // limit to 6 characters
      if ( length >= 6 ) {
        e.preventDefault();
        return;
      }

      // if handling keycodes 0-9, subtract 48
      if ( key >= 48 && key <= 57 ) {
        key -= 48;
      }


      // check if numeric
      var isNumeric = ( ! isNaN(parseFloat(key)) && isFinite(key) );
      if ( isNumeric ) {
        this.password += key;
      }
    },

    function onNextClicked (e) {
      var self = this;

      if ( ! this.serialNumber ) {
        this.tag(this.ErrorMessage.create({ message: 'Device not found' }));
        return;
      }

      if ( ! this.password ) {
        this.tag(this.ErrorMessage.create({ message: 'Please enter a password' }));
        return;
      }
      this.deviceAuth.login(null, 'device-' + this.serialNumber, this.password)
      .then(function (result) {
        if ( ! result ) {
          throw new Error('Device activation failed');
        }
        self.user.copyFrom(result);
        return self.deviceDAO.where(self.EQ(self.Device.SERIAL_NUMBER, self.serialNumber)).limit(1).select();
      })
      .then(function (result) {
        if ( ! result || ! result.array || result.array.length !== 1 ) {
          throw new Error('Device activation failed');
        }

        if ( result.array[0].status !== self.DeviceStatus.ACTIVE ) {
          throw new Error('Device activation failed');
        }

        self.loginSuccess = true;
        self.device.copyFrom(result.array[0]);
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupSuccessView' });
      })
      .catch(function (err) {
        self.loginSuccess = false;
        self.tag(self.ErrorMessage.create({ message: err.message }));
      });
    }
  ]
});
