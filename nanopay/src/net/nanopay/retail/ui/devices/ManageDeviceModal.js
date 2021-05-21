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
  package: 'net.nanopay.retail.ui.devices',
  name: 'ManageDeviceModal',
  extends: 'foam.u2.Controller',

  documentation: 'Pop up modal for deleting a device',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'deviceDAO', 
    'closeDialog',
    'notify', 
    'selectedDevice'
  ],

  css: `
    ^ {
      width: 448px;
      height: 200px;
      margin: auto;
    }
    ^ .deleteContainer {
      width: 448px;
      height: 200px;
      border-radius: 2px;
      background-color: #ffffff;
      box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.02);
      position: relative;
    }
    ^ .popUpHeader {
      width: 448px;
      height: 40px;
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .popUpTitle {
      width: 198px;
      height: 40px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 40.5px;
      letter-spacing: 0.2px;
      text-align: left;
      color: #ffffff;
      margin-left: 20px;
      display: inline-block;
    }
    ^ .foam-u2-ActionView-closeButton {
      width: 24px;
      height: 24px;
      margin: 0;
      margin-top: 7px;
      margin-right: 20px;
      display: inline-block;
      float: right;
      outline: 0;
      border: none;
      background: transparent;
      box-shadow: none;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      background: transparent;
      background-color: transparent;
    }
    ^ .foam-u2-ActionView-deleteButton {
      width: 136px;
      height: 40px;
      background: rgba(164, 179, 184, 0.1);
      border: solid 1px #ebebeb;
      display: inline-block;
      color: /*%BLACK%*/ #1e1f21;
      margin: 0;
      float: left;
    }
    ^ .foam-u2-ActionView-deleteButton:hover {
      background: lightgray;
    }
    ^ .descriptionStyle {
      text-align: center;
      margin-top: 45px;
    }
    ^ .button-container {
      width: 344px;
      height: 40px;
      position: absolute;
      bottom: 0;
      padding-left: 52px;
      padding-right: 52px;
      margin-bottom: 20px;
    }
  `,

  properties: [],

  messages: [
    { name: 'Title', message: 'Manage Device' },
    { name: 'Description', message: 'Please select an option to manage your device.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.addClass(this.myClass())
      .start()
        .start().addClass('deleteContainer')
          .start().addClass('popUpHeader')
          .start().add(this.Title).addClass('popUpTitle').end()
          .add(this.CLOSE_BUTTON)
        .end()
        .start().add(this.Description).addClass('descriptionStyle').end()
        .start().addClass('button-container')
          .add(this.DELETE_BUTTON)
        .end()
      .end();
    }
  ],

  actions: [
    {
      name: 'closeButton',
      icon: 'images/ic-cancelwhite.svg',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'deleteButton',
      label: 'Delete',
      confirmationRequired: function() {
        return true;
      },
      code: function(X) {
        var self = this;

        X.deviceDAO.remove(X.selectedDevice).then(function(response) {
          X.notify('Device successfully deleted.', '', self.LogLevel.INFO, true);
          X.closeDialog();
        }).catch(function(error) {
          X.notify(error.message, '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});