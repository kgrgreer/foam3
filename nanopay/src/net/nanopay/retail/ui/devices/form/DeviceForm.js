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
  name: 'DeviceForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a device',

  requires: [
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus',
    'foam.log.LogLevel'
  ],

  imports: [
    'user',
    'deviceDAO',
    'notify'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css:
    `
    ^ p {
      margin: 0;
      font-size: 12px;
      color: /*%BLACK%*/ #1e1f21;
      line-height: 1.33;
    }

    ^ .stepRow {
      margin-bottom: 40px;
    }

    ^ .instructionsRow {
      margin-bottom: 40px;
    }

    ^ input {
      width: 220px;
      height: 40px;
      box-sizing: border-box;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding-left: 15px;
      padding-right: 15px;
      outline: none;
      margin-top: 8px;
    }

    ^ .inputFieldLabel {
      margin-right: 20px;
      vertical-align: top;
      margin-bottom: 8px;
    }

    ^ .inputErrorLabel {
      display: inline-block;
      color: red !important;
      vertical-align: top;
    }
  `,

  methods: [
    function init() {
      this.title = 'Add Device';
      // this.isCustomNavigation = true;
      this.views = [
        { parent: 'addDevice', id: 'form-addDevice-name',     label: 'Name',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceNameForm' } },
        { parent: 'addDevice', id: 'form-addDevice-serial',   label: 'Serial #',  view: { class: 'net.nanopay.retail.ui.devices.form.DeviceSerialForm' } },
        { parent: 'addDevice', id: 'form-addDevice-password', label: 'Password',  view: { class: 'net.nanopay.retail.ui.devices.form.DevicePasswordForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      code: function(X) {
        if ( this.position === 0 || this.position > 2 ) {
          X.stack.push({ class: 'net.nanopay.retail.ui.devices.DevicesView' });
        } else {
          this.subStack.back();
        }
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      code: function(X) {
        var self = this;

        // Info from form
        var deviceInfo = this.viewData;

        if ( this.position == 0 ) {
          // Device Name

          if ( ( deviceInfo.deviceName == null || deviceInfo.deviceName.trim() == '' ) ) {
            X.notify('Please fill out all necessary fields before proceeding.', '', self.LogLevel.ERROR, true);
            return;
          }

          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }

        if ( this.position == 1 ) {
          // Device Serial Number

          if ( ! /^[a-zA-Z0-9]{16}$/.exec(deviceInfo.serialNumber) ) {
            X.notify('Please enter a valid serial number before proceeding.', '', self.LogLevel.ERROR, true);
            return;
          }

          // generate random password
          this.viewData.password = Math.floor(Math.random() * (999999 - 100000)) + 100000;

          // create new device
          var deviceInfo = this.viewData;
          var newDevice = this.Device.create({
            name: deviceInfo.deviceName,
            status: this.DeviceStatus.PENDING,
            serialNumber: deviceInfo.serialNumber,
            password: deviceInfo.password,
            owner: this.user.id
          });

          // add to deviceDAO
          this.deviceDAO.put(newDevice).then(function (result) {
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.complete = true;
            self.nextLabel = 'Done';
          })
          .catch(function (err) {
            X.notify(err.message, '', self.LogLevel.ERROR, true);
          });
          return;
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          X.stack.push({ class: 'net.nanopay.retail.ui.devices.DevicesView' });
          return;
        }
      }
    }
  ]
});
