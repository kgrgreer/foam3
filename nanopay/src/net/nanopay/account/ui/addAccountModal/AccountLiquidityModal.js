foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for setting liquidity settings for the account',

  requires: [
    'net.nanopay.account.ui.addAccountModal.AccountLiquidityViewModel',
    'net.nanopay.account.ui.addAccountModal.AccountSettingsLiquidityRulesViewModel',
    'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar',
    'foam.u2.DetailView',
  ],

  messages: [
    { name: 'TITLE', message: 'Set the high & low liquidity threshold rules...' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.AccountSettingsLiquidityRulesViewModel',
      name: 'accountSettingsLiquidityRules',
      factory: function() {
        if ( this.viewData.accountSettingsLiquidity ) {
          return this.viewData.accountSettingsLiquidity;
        } else {
          var options = this.AccountSettingsLiquidityRulesViewModel.create();
          this.viewData.accountSettingsLiquidity = options;
          return options;
        }
      }
    },
    {
      class: 'boolean',
      name: 'isLit'
    }
  ],

  methods: [
    function initE() {
      console.log(this.viewData);
      console.log(this.LiquidityThresholdRules.SEND);
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 90 }).end()
        .start(IS_LIT).end()
        // DONE: Put view model here
        .start(this.DetailView, { data: this.accountSettingsLiquidityRules }).end()
        .start(this.DetailView, this.accountSettingsLiquidityRules.liquidityThresholdRules === this.LiquidityThresholdRules.PLACEHOLDER ? null : { data: this.AccountLiquidityViewModel.create() }).end()
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
