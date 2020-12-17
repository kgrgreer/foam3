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
  name: 'DeviceTypeForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for just the device type.',

  css: `
    ^ .deviceTypeOption {
      box-sizing: border-box;
      position: relative;
      vertical-align: top;
      width: 80px;
      height: 80px;
      background-color: #FFFFFF;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.01);
      border: solid 1px /*%GREY5%*/ #f5f7fa;
      margin-top: 8px;
    }

    ^ .deviceTypeOption.selected {
      border: solid 1px #1CC2B7;
    }

    ^ .deviceTypeOption:hover {
      cursor: pointer;
      background-color: #f1f1f1;
    }

    ^ .imageCenter {
      display: block;
      margin: auto;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    ^ .optionSpacer {
      margin-right: 40px;
      display: inline-block;
    }

    ^ .optionSpacer:last-child {
      margin-right: 0;
    }

    ^ .optionTitleContainer {
      display: inline-block;
      width: 80px;
      height: 16px;
      margin-right: 40px;
    }

    ^ .optionTitleContainer:last-child {
      margin-right: 0;
    }

    ^ .optionTitle {
      margin: auto;
      width: fit-content;
      font-size: 10px;
      line-height: 16px;
      letter-spacing: 0.3px;
      color: #8F8F8F;
    }

    ^ .descRow {
      margin-top: 8px;
    }
  `,

  messages: [
    { name: 'Step',             message: 'Step 2: Select your device type.' },
    { name: 'DeviceTypeLabel',  message: 'Device Type *' },
    { name: 'Instructions',     message: 'Please navigate to the Merchant Web App (for iOS and Android tablets only).' },
    { name: 'Error',            message: 'Device type required' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'selectedOption',
      value: -1,
      factory: function () {
        return this.viewData.selectedOption;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.selectedOption = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('stepRow')
          .start('p').add(this.Step).end()
        .end()
        .start('p').addClass('infoLabel').add(this.DeviceTypeLabel).end()
        .start('div')
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 1 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'images/apple.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 1;
            })
          .end()
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 2 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'images/android.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 2;
            })
          .end()
          .start('div').addClass('deviceTypeOption').addClass('optionSpacer')
            .addClass(self.selectedOption$.map(function(o) { return o == 3 ? 'selected' : ''; }))
            .start({class: 'foam.u2.tag.Image', data: 'images/ingenico.svg'}).addClass('imageCenter').end()
            .on('click', function(){
              self.selectedOption = 3;
            })
          .end()
        .end()
        .start('div').addClass('descRow').addClass('instructionsRow')
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Apple').end()
          .end()
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Android').end()
          .end()
          .start('div').addClass('optionTitleContainer')
            .start('p').addClass('optionTitle').add('Ingenico').end()
          .end()
        .end()
        .start('p').add(this.Instructions).end()
    }
  ]
});
