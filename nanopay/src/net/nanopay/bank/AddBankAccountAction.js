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

  documentation: 'An action that displays the view to add a bank account.',

  requires: [
    'net.nanopay.sme.ui.SMEModal'
  ],

  imports: [
    'auth',
    'ctrl',
    'stack',
    'subject'
  ],

  messages: [
    { name: 'ACTION_LABEL', message: 'Add account' },
  ],
  
  properties: [
    {
      name: 'name',
      value: 'addBank'
    },
    {
      name: 'label',
      factory: function() {
        return this.ACTION_LABEL;
      }
    },
    {
      class: 'Function',
      name: 'code',
      value: async function(X) {
        let permission = await X.auth.check(null, 'multi-currency.read');
        if ( permission ) {
          X.stack.push({
            class: 'net.nanopay.bank.ui.BankPickCurrencyView'
          }, X);
        } else {
          X.ctrl.add(net.nanopay.sme.ui.SMEModal.create({}, X)
          .addClass('bank-account-popup').tag({
            class: 'net.nanopay.account.ui.BankAccountWizard',
            data: (foam.lookup(`net.nanopay.bank.${ X.subject.user.address.countryId }BankAccount`)).create({}, X),
            useSections: ['clientAccountInformation', 'pad'],
            config: {
              id: { updateVisibility: 'HIDDEN' },
              summary: { updateVisibility: 'HIDDEN' }
            }
          }));
        }
      }
    }
  ]
});