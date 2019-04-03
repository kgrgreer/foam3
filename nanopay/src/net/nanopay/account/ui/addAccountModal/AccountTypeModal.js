foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountTypeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account type selection',

  messages: [
    { name: 'TITLE', message: 'Select an account type to create...' }
  ],

  properties: [
    
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.account.ui.addAccountModal.ModalTitleBar', title: this.TITLE }).end()
        .start({ class: 'net.nanopay.account.ui.addAccountModal.ModalProgressBar', percentage: 25 }).end()
        // TODO: Put view model here
        .start() //This is where the next button container is
          .start(this.NEXT).end()
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
