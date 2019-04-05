foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for setting liquidity settings for the account',

  requires: [
    'net.nanopay.account.ui.addAccountModal.AccountSettingsLiquidityRulesViewModel',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar',
    'foam.u2.DetailView',
  ],

  messages: [
    { name: 'TITLE', message: 'Set the high & low liquidity threshold rules...' }
  ],

  properties: [
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 90 }).end()
        .start(this.DetailView, { data: this.AccountSettingsLiquidityRulesViewModel.create() }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
