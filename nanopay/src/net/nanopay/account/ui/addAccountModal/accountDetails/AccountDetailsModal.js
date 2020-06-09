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
  package: 'net.nanopay.account.ui.addAccountModal.accountDetails',
  name: 'AccountDetailsModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account details',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddShadowAccount',
    'net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddVirtualAccount',
    'net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes.AddAggregateAccount',
    'net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements',
    'net.nanopay.account.ui.addAccountModal.components.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.components.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Add details to this account...' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isAggregate',
      documentation: `
        A boolean check if the account type selected is an Aggregate account
      `,
      expression: function(viewData) {
        return viewData.accountTypeForm.accountTypePicker == net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.AGGREGATE_ACCOUNT;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'accountDetailsForm',
      documentation: `
        The account details form to render a different add details form depending on what
        account type was selected
      `,
      factory: function() {
        if ( this.viewData.accountDetailsForm ) {
          return this.viewData.accountDetailsForm;
        }
        var form;
        switch (this.viewData.accountTypeForm.accountTypePicker) {
          case net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.SHADOW_ACCOUNT :
            form = this.AddShadowAccount.create();
            break;
          case net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.VIRTUAL_ACCOUNT :
            form = this.AddVirtualAccount.create();
            break;
          case net.nanopay.account.ui.addAccountModal.accountType.AccountTypes.AGGREGATE_ACCOUNT :
            form = this.AddAggregateAccount.create();
            break;
        }
        this.viewData.accountDetailsForm = form;
        return form;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsRequirements',
      name: 'accountSettingsOptions',
      documentation: `
        To create account settings option if not an aggregate account so that we can
        later on set transactions limits and liquidity threshold rules.
      `,
      factory: function() {
        if ( this.isAggregate ) {
          this.viewData.accountSettingsOptions = null;
          return null;
        }

        if ( this.viewData.accountSettingsOptions ) {
          return this.viewData.accountSettingsOptions;
        }

        var options = this.AccountDetailsRequirements.create();
        this.viewData.accountSettingsOptions = options;
        return options;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 50 }).end()
        .start(this.DetailView, { data: this.accountDetailsForm }).end()
        .callIf(!this.isAggregate, function() {
          this.start(this.DetailView, { data: this.accountSettingsOptions }).end();
        })
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      isEnabled: function(accountDetailsForm$errors_) {
        // TODO: Proper Form Validation REQUIRED
        if ( accountDetailsForm$errors_ ) {
          console.error(accountDetailsForm$errors_[0][1]);
          return false;
        }

        return true;
      },
      code: function(X) {
        // Need to do a check if limits are required
        var accountSettings = X.viewData.accountSettingsOptions;
        if ( accountSettings ) {
          accountSettings.isLimitRequired ? X.pushToId('limits') : accountSettings.isLiquidityRequired ? X.pushToId('liquidity') : X.pushToId('submit');
          return;
        }
        X.pushToId('submit');
      }
    }
  ]
});
