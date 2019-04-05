foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountDetailsModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account details',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.AccountSettingsRequirementViewModel',
    'net.nanopay.account.ui.addAccountModal.AccountDetailsViewModel',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Add details to this account...' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.AccountSettingsRequirementViewModel',
      name: 'accountSettingsOptions',
      factory: function() {
        if ( this.viewData.accountSettingsOptions ) {
          return this.viewData.accountSettingsOptions;
        } else {
          var options = this.AccountSettingsRequirementViewModel.create();
          this.viewData.accountSettingsOptions = options;
          return options;
        }
      }
    }
  ],

  methods: [
    function initE() {
      console.log(this.viewData);
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 50 }).end()
        // TODO: Put view model here
        .start(this.DetailView, { data: this.AccountDetailsViewModel.create() }).end()
        .start(this.DetailView, { data: this.accountSettingsOptions }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        // Need to do a check if limits are required
        X.viewData.accountSettingsOptions.isLimitRequired ? X.pushToId('limits') : X.viewData.accountSettingsOptions.isLiquidityRequired ? X.pushToId('liquidity') : X.closeDialog();
      }
    }
  ]
});
