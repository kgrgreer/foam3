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
  package: 'net.nanopay.bank',
  name: 'AddBankAccountAction',
  extends: 'foam.core.Action',

  documentation: '',

  requires: [
    'net.nanopay.sme.ui.SMEModal'
  ],

  imports: [
    'ctrl',
    'stack',
    'auth',
    'subject'
  ],
  
  properties: [
    {
      name: 'name',
      value: 'addBank'
    },
    {
      name: 'label',
      value: 'Add account'
    },
    {
      class: 'Function',
      name: 'code',
      value: async function(X) {
        let permission = await this.auth.check(null, 'multi-currency.read');
        if ( permission ) {
          X.controllerView.stack.push({
            class: 'net.nanopay.bank.ui.BankPickCurrencyView'
          }, this);
        } else {
          this.ctrl.add(this.SMEModal.create({
            onClose : function() { this.__subContext__.data.clearProperty('bankAccount'); }
          }).addClass('bank-account-popup').tag({
            class: 'net.nanopay.account.ui.BankAccountWizard',
            data: (foam.lookup(`net.nanopay.bank.${ this.subject.user.address.countryId }BankAccount`)).create({}, this),
            useSections: ['accountInformation', 'pad']
          }));
        }
      }
    }
  ]
});