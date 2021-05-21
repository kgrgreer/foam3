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
  package: 'net.nanopay.account.ui.addAccountModal.transactionLimit',
  name: 'AccountTransactionLimitModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for setting maximum transaction limit for account',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimit',
    'net.nanopay.account.ui.addAccountModal.components.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.components.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Set the transaction limit for this account...' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimit',
      name: 'accountLimitForm',
      factory: function() {
        if ( this.viewData.accountLimitForm ) {
          return this.viewData.accountLimitForm;
        }

        var form = this.AccountTransactionLimit.create();
        this.viewData.accountLimitForm = form;
        return form;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 80 }).end()
        .start(this.DetailView, { data: this.accountLimitForm }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      isEnabled: function(accountLimitForm$errors_) {
        // TODO: Proper Form Validation REQUIRED
        if ( accountLimitForm$errors_ ) {
          console.error(accountLimitForm$errors_[0][1]);
          return false;
        }

        return true;
      },
      code: function(X) {
        // Need to do a check if liquidity are required
        X.viewData.accountSettingsOptions.isLiquidityRequired ? X.pushToId('liquidity') : X.pushToId('submit');
      }
    }
  ]
});
