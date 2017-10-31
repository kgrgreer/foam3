foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupInputView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.merchant.ui.transaction.TransactionToolbar'
  ],

  imports: [
    'device',
    'stack',
    'deviceDAO',
    'serialNumber',
    'toolbarIcon',
    'toolbarTitle'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  properties: [
    ['header', true],
    { class: 'String', name: 'retailCode', value: '000000' },
    { class: 'Boolean', name: 'focused', value: false }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background: #2c4389;
        }
        ^ h4{
          width: 259px;
          font-weight: 300;
          text-align: center;
          margin: auto;
          margin-top: 95px;
        }
        ^ .retail-code {
          border: none;
          margin-top: 50px;
          margin-left: 46px;
          margin-right: 36px;
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
          letter-spacing: 19px;
          font: 4.25ch Roboto, monospace;
        }
        ^ .retail-code span:empty:before {
          content: "\200b";
        }
        ^ input:focus{
          outline: none;
          color: transparent;
          text-shadow: 0px 0px 0px white;
        }
        ^ .setup-next-wrapper {
          position: fixed;
          bottom: 0px;
        }
        ^ .setup-next-button {
          width: 320px;
          height: 72px;
          background-color: #26a96c;
        }
      */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
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
        .start('div').addClass('retail-code')
          .attrs({ autofocus: true, tabindex: 1 })
          .add(this.retailCode$)
        .end()
        .start('div').addClass('setup-next-wrapper')
          .start('button').addClass('setup-next-button')
            .add('Next')
            .on('click', this.onNextClicked)
          .end()
        .end()
    }
  ],

  listeners: [
    function onKeyPressed (e) {
      var key = e.key || e.keyCode;
      if ( ! this.focused ) {
        this.retailCode = '';
        this.focused = true;
      }

      console.log('key =', key);

      if ( ( key === 'Enter' || key === 13 ) ) {
        this.onNextClicked(e);
        return;
      }

      var length = this.retailCode.length;
      // handle backspace
      if ( key === 'Backspace' || key === 8 && length > 0 ) {
        this.retailCode = this.retailCode.substring(0, length - 1);
        return;
      }

      if ( length >= 6 ) {
        e.preventDefault();
        return;
      }

      var isNumeric = ( ! isNaN(parseFloat(key)) && isFinite(key) );
      if ( isNumeric ) {
        this.retailCode += key;
      }
    },

    function onNextClicked (e) {
      var self = this;

      // look up device, set to active and save
      this.deviceDAO.where(this.AND(
        this.EQ(this.Device.SERIAL_NUMBER, this.serialNumber),
        this.EQ(this.Device.PASSWORD, this.retailCode)
      )).select().then(function (result) {
        if ( ! result ) {
          throw new Error('Device not found');
        }

        if ( ! result.array || result.array.length !== 1 ) {
          throw new Error('Device not found');
        }

        var device = result.array[0];
        device.status = self.DeviceStatus.ACTIVE;
        return self.deviceDAO.put(device);
      })
      .then(function (result) {
        if ( ! result ) {
          throw new Error('Device activation failed');
        }

        self.device.copyFrom(result);
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupSuccessView' });
      })
      .catch(function (err) {
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupErrorView' });
      });
    }
  ]
});