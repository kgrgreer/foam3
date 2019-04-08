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
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.account.ui.addAccountModal.AccountTypeViewModel',
      name: 'accountTypeForm',
      factory: function() {
        if ( this.viewData.accountTypeForm ) {
          return this.viewData.accountTypeForm;
        }

        var form = this.AccountTypeViewModel.create();
        this.viewData.accountTypeForm = form;
        return form;
      }
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { percentage: 25 }).end()
        .start(this.DetailView, { data: this.accountTypeForm }).end()
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
