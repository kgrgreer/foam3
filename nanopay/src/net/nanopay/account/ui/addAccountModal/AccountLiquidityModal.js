foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for setting liquidity settings for the account',

  requires: [
    'net.nanopay.account.ui.addAccountModal.AccountLiquidityExistingOrNew',
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
      of: 'net.nanopay.account.ui.addAccountModal.AccountLiquidityExistingOrNew',
      name: 'liquidityForm',
      factory: function() {
        if ( this.viewData.liquidityForm ) {
          return this.viewData.liquidityForm;
        }

        var form = this.AccountLiquidityExistingOrNew.create();
        this.viewData.liquidityForm = form;
        return form;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 90 }).end()
        .start(this.DetailView, { data: this.liquidityForm }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      isEnabled: function(liquidityForm$errors_) {
        // TODO: Proper Form Validation REQUIRED
        if ( liquidityForm$errors_ ) {
          console.error(liquidityForm$errors_[0][1]);
          return false;
        }
        return true;
      },
      code: function(X) {
        X.pushToId('submit');
      }
    }
  ]
});
