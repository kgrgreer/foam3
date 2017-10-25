foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  imports: [
    'device',
    'stack',
    'deviceDAO',
    'serialNumber'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 480px;
          background: #2c4389;
        }
        ^ .setup-title {
          height: 30px;
          font-size: 16px;
          line-height: 1.88;
          text-align: center;
          color: #ffffff;
          padding-top: 76px;
        }
        ^ .serial-number-label {
          height: 29px;
          font-size: 25px;
          font-weight: 500;
          text-align: center;
          color: #ffffff;
          padding-top: 44px;
        }
        ^ .setup-instructions {
          height: 60px;
          font-size: 16px;
          line-height: 1.25;
          text-align: center;
          color: #ffffff;
          padding-top: 66px;
        }
        .setup-next-wrapper {
          padding-top: 103px;
        }
        .setup-next-button {
          width: 320px;
          height: 72px;
          background-color: #26a96c;
        }
      */}
    })
  ],

  properties: [
    ['header', false]
  ],

  messages: [
    { name: 'instructions', message: 'Input the serial number above in the retail portal and press next to provision this device.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start()
          .addClass('setup-title')
          .add('Serial Number')
        .end()
        .start()
          .addClass('serial-number-label')
          .add(this.serialNumber.replace(/(.{4})/g, '$1 '))
        .end()
        .start()
          .addClass('setup-instructions')
          .add(this.instructions)
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
    function onNextClicked (e) {
      this.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupInputView' });
    }
  ]
});