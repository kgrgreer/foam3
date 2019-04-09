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
    function init() {
      this.SUPER();
      var self = this;
      this.onDetach(this.accountTypeForm$.dot('accountTypePicker').sub(function() {
        if ( self.accountTypeForm.accountTypePicker !=  self.viewData.previousTypeSelected ) {
          self.viewData.accountDetailsForm = null;
          self.viewData.accountSettingsOptions = null;
        }

        // Purely for UX tracking
        self.viewData.previousTypeSelected = self.accountTypeForm.accountTypePicker
      }));
    },
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
      isEnabled: function(accountTypeForm$errors_) {
        // TODO: Proper Form Validation REQUIRED
        if ( accountTypeForm$errors_ ) {
          console.error(accountTypeForm$errors_[0][1]);
          return false;
        }

        return true;
      },
      code: function(X) {
        X.pushToId('details');
      }
    }
  ]
});
