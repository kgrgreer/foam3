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
  package: 'net.nanopay.contacts.ui',
  name: 'ContactTableView',
  extends: 'foam.u2.view.ScrollTableView',

  exports: [
    'dblclick'
  ],

  properties: [
    {
      name: 'editColumnsEnabled',
      value: false
    },
    {
      name: 'columns',
      value: [
        'organization',
        'firstName',
        'lastName',
        'email',
        'businessAddress.countryId',
        'bankAccount.denomination',
        'signUpStatus'
      ]
    }
  ],

  listeners: [
    function dblclick() {
      controllerMode_ = foam.u2.ControllerMode.EDIT;
      if ( this.selection.createBankAccount === undefined ) {
        this.data.createBankAccount = net.nanopay.bank.CABankAccount.create({ isDefault: true }, X);
        controllerMode_ = foam.u2.ControllerMode.CREATE;
      }
      this.add(net.nanopay.ui.wizard.WizardController.create({
        model: 'net.nanopay.contacts.Contact',
        data: this.selection,
        controllerMode: controllerMode_,
        isEdit: controllerMode_ === foam.u2.ControllerMode.EDIT
      }, this.__subContext__));
    }
  ]
});