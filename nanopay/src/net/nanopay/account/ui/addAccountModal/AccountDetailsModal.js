foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountDetailsModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account details',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.ShadowAccountViewModel',
    'net.nanopay.account.ui.addAccountModal.VirtualAccountViewModel',
    'net.nanopay.account.ui.addAccountModal.AggregateAccountViewModel',
    'net.nanopay.account.ui.addAccountModal.AccountSettingsRequirementViewModel',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Add details to this account...' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isAggregate',
      expression: function(viewData) {
        return viewData.accountTypeForm.accountTypePicker == net.nanopay.account.ui.addAccountModal.AccountType.AGGREGATE_ACCOUNT;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'accountDetailsForm',
      factory: function() {
        if ( this.viewData.accountDetailsForm ) {
          return this.viewData.accountDetailsForm;
        }
        var form;
        switch (this.viewData.accountTypeForm.accountTypePicker) {
          case net.nanopay.account.ui.addAccountModal.AccountType.SHADOW_ACCOUNT :
            form = this.ShadowAccountViewModel.create();
            break;
          case net.nanopay.account.ui.addAccountModal.AccountType.VIRTUAL_ACCOUNT :
            form = this.VirtualAccountViewModel.create();
            break;
          case net.nanopay.account.ui.addAccountModal.AccountType.AGGREGATE_ACCOUNT :
            form = this.AggregateAccountViewModel.create();
            break;
        }
        this.viewData.accountDetailsForm = form;
        return form;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.AccountSettingsRequirementViewModel',
      name: 'accountSettingsOptions',
      factory: function() {
        if ( this.isAggregate ) {
          this.viewData.accountSettingsOptions = null;
          return null;
        }

        if ( this.viewData.accountSettingsOptions ) {
          return this.viewData.accountSettingsOptions;
        }

        var options = this.AccountSettingsRequirementViewModel.create();
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
        if ( X.viewData.accountDetailsForm.accountName.length === 0 || !X.viewData.accountDetailsForm.accountName.trim() ) {
          // TODO: Error Message
          console.error('Account name required to proceed.');
          return;
        }

        if ( !X.viewData.accountDetailsForm.countryPicker ) {
          console.error('Account Country required to proceed.');
          return;
        }

        // Need to do a check if limits are required
        X.viewData.accountSettingsOptions.isLimitRequired ? X.pushToId('limits') : X.viewData.accountSettingsOptions.isLiquidityRequired ? X.pushToId('liquidity') : X.pushToId('submit');
      }
    }
  ]
});
