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
  package: 'net.nanopay.account.ui.addAccountModal.accountType',
  name: 'AccountTypeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account type selection',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.accountType.AccountType',
    'net.nanopay.account.ui.addAccountModal.components.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.components.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Select an account type to create...' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.accountType.AccountType',
      name: 'accountTypeForm',
      documentation: `
        To create the account type form if the user has not already done so previously
      `,
      factory: function() {
        if ( this.viewData.accountTypeForm ) {
          return this.viewData.accountTypeForm;
        }

        var form = this.AccountType.create();
        this.viewData.accountTypeForm = form;
        return form;
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;
      
      // settings up a listener for the account type and either saving or resetting data
      // if the user decides to change the account type
      this.onDetach(this.accountTypeForm$.dot('accountTypePicker').sub(function() {
        if ( self.accountTypeForm.accountTypePicker !=  self.viewData.previousTypeSelected ) {
          self.viewData.accountDetailsForm = null;
          self.viewData.accountSettingsOptions = null;
        }

        // Purely for UX tracking
        self.viewData.previousTypeSelected = self.accountTypeForm.accountTypePicker
      }));
    },
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 25 }).end()
        .start(this.DetailView, { data: this.accountTypeForm }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      isEnabled: function(accountTypeForm$errors_) {
        // TODO: Proper Form Validation REQUIRED
        if ( accountTypeForm$errors_ ) {
          console.error(accountTypeForm$errors_[0][1]);
          return false;
        }

        return true;
      },
      code: function(X) {
        X.pushToId('details');
      }
    }
  ]
});
