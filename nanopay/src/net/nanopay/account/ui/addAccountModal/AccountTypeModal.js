foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountTypeModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for account type selection',

  requires: [
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  messages: [
    { name: 'TITLE', message: 'Select an account type to create...' }
  ],

  properties: [

  ],

  methods: [
    function init() {
      this.SUPER();
      // Clear this when the user goes back into this screen
      this.viewData.accountSettingsOptions = null;
    },
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 25 }).end()
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
        X.pushToId('details');
      }
    }
  ]
});
