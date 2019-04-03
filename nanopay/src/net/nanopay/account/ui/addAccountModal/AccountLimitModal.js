foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLimitModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for setting maximum transaction limit for account',

  requires: [
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Set the transaction limit for this account...' }
  ],

  properties: [

  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 80 }).end()
        // TODO: Put view model here
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        // Need to do a check if liquidity are required
        X.viewData.accountSettingsOptions.isLiquidityRequired ? X.pushToId('liquidity') : X.closeDialog();
      }
    }
  ]
});
