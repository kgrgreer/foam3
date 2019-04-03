foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountTypeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account type selection',

  requires: [
    'foam.u2.DetailView',
    'net.nanopay.account.ui.addAccountModal.AccountTypeViewModel',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Select an account type to create...' }
  ],

  properties: [

  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 25 }).end()
        // TODO: Put view model here
        .start(this.DetailView, { data: this.AccountTypeViewModel.create() }).end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      code: function(X) {
        X.pushToId('details');
      }
    }
  ]
});
