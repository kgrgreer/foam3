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
  package: 'net.nanopay.retail.ui.devices.form',
  name: 'DevicePasswordForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to display device password.',

  css: `
    ^ .passwordLabel {
      font-size: 45px;
      letter-spacing: 24px;
      color: /*%BLACK%*/ #1e1f21;
    }
  `,

  requires: [
    'net.nanopay.retail.model.Device'
  ],

  messages: [
    { name: 'Step',         message: 'Step 3: Use the following code.' },
    { name: 'Instructions', message: 'Please input the following code on the device you want to provision and follow the instructions on your device to finish the process.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())

        .start('div').addClass('stepRow')
          .start('p').add(this.Step).end()
        .end()
        .start('p').addClass('instructionsRow').add(this.Instructions).end()
        .start('p').addClass('passwordLabel').add(this.viewData.password).end()
    }
  ]
});
