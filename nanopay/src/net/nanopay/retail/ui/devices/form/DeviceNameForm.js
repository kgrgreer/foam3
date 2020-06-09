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
  name: 'DeviceNameForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for just the device name.',

  messages: [
    { name: 'Step',         message: 'Step 1: Name your device.' },
    { name: 'Instructions', message: 'Please name your device to help distinguish it among other devices.' },
    { name: 'NameLabel',    message: 'Name *' }
  ],

  properties: [
    {
      class: 'String',
      name: 'deviceName',
      factory: function () {
        return this.viewData.deviceName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.deviceName = newValue;
      }
    }
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
        .start('div').addClass('row')
          .start().addClass('infoLabel').add(this.NameLabel).end()
            .start(this.DEVICE_NAME).end()
          .end()
        .end()
    }
  ]
});
