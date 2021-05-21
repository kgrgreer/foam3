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
  name: 'SetupView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  imports: [
    'stack',
    'serialNumber',
    'showAbout'
  ],

  css: `
    ^ {
      background: /*%BLACK%*/ #1e1f21;
    }
    ^ .setup-title {
      height: 30px;
      font-size: 16px;
      line-height: 1.88;
      text-align: center;
      color: #ffffff;
      padding-top: 20px;
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
    ^ .setup-next-wrapper {
      width: 100%;
      position: fixed;
      bottom: 0px;
    }
    ^ .setup-next-button {
      width: 100%;
      height: 72px;
      background-color: #26a96c;
    }
  `,

  properties: [
    ['header', false]
  ],

  messages: [
    { name: 'instructions', message: 'Input the serial number above in the retail portal and press next to provision this device.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.showAbout = false;
      
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