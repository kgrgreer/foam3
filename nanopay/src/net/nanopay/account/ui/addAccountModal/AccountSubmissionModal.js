foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountSubmissionModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Modal Sub View for the submission of a created account',

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.ui.addAccountModal.ModalTitleBar',
    'net.nanopay.account.ui.addAccountModal.ModalProgressBar'
  ],

  imports: [
    'accountDAO',
    'user'
  ],

  messages: [
    { name: 'TITLE', message: 'Creating your account...' }
  ],

  properties: [
    {
      class: 'Int',
      name: 'percentage',
      value: 0
    },
    'progressBar'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE }).end()
        .start(this.ModalProgressBar, { isIndefinite: true }, this.progressBar$).end()
        .start().addClass(this.myClass('outer-ring')) // Margin for outer ring + border + padding for inner circle
          .start().addClass(this.myClass('inner-ring')) // Inner circle
            .start({ class: 'foam.u2.tag.Image', data: 'images/gray-check.svg'}).end()
          .end()
        .end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end();


    },

    function createAccount() {
      var account;
      switch ( this.viewData.accountTypeForm.accountTypePicker ) {
        case net.nanopay.account.ui.addAccountModal.AccountType.SHADOW_ACCOUNT :
          // TODO: NOT IN DEV
          break;
        case net.nanopay.account.ui.addAccountModal.AccountType.AGGREGATE_ACCOUNT :
          account = this.AggregateAccount.create();
          break;
        case net.nanopay.account.ui.addAccountModal.AccountType.VIRTUAL_ACCOUNT :
          account = this.DigitalAccount.create();
          break;
      }

      // TODO: Please allow user to set the owner of account
      account.owner = user;

      var accountDetails = this.viewData.accountDetailsForm;
      account.name = accountDetails.accountName;
      account.country = accountDetails.countryPicker
      account.denomination = accountDetails.currencyPicker;
      // TODO: Add memo to account (currently doesn't currently have the property)
      account.desc = accountDetails.memo;

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
