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
    {
      class: 'Boolean',
      name: 'isUploading',
      value: false
    },
    'progressBar'
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.ModalTitleBar, { title: this.TITLE, forceBackHidden: true }).end()
        .start(this.ModalProgressBar, { isIndefinite: true }, this.progressBar$).end()
        .start().addClass(this.myClass('outer-ring')) // Margin for outer ring + border + padding for inner circle
          .start().addClass(this.myClass('inner-ring')) // Inner circle
            .start({ class: 'foam.u2.tag.Image', data: 'images/gray-check.svg'}).end()
          .end()
        .end()
        .start() //This is where the next button container is
          .start(this.NEXT, { data: this }).end()
        .end();
      // this.submitInformation();
    },

    async function submitInformation() {
      var uploadedAccount = await this.uploadAccount();
      // TODO: Put LiquiditySettings into DAO and bind it to this account;

      this.progressBar.stopAnimation();
      this.isUploading = false;
    },

    async function uploadAccount() {
      var uploadedAccount = await this.accountDAO.put(this.createAccount());
      return uploadAccount;
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
      account.owner = this.user;

      var accountType = this.viewData.accountTypeForm.accountTypePicker
      var accountDetails = this.viewData.accountDetailsForm;

      account.name = accountDetails.accountName;
      // TODO: Add memo to account (currently doesn't currently have the property)
      account.desc = accountDetails.memo;

      if ( accountType != net.nanopay.account.ui.addAccountModal.AccountType.SHADOW_ACCOUNT) {
        // In Liquid, no shadow should have a parent
        account.parent = accountDetails.parentAccountPicker;
      }

      if ( accountType != net.nanopay.account.ui.addAccountModal.AccountType.AGGREGATE_ACCOUNT) {
        // Aggregate accounts do not need country or denomination
        // but both Shadow and Virtual require them
        account.country = accountDetails.countryPicker;
        account.denomination = accountDetails.currencyPicker;
      }

      if ( accountType == net.nanopay.account.ui.addAccountModal.AccountType.SHADOW_ACCOUNT) {
        // Shadow has an associated bank account
        account.bank = accountDetails.bankAccountPicker;
      }

      return account;
    }
  ],

  actions: [
    {
      name: 'next',
      label: 'Finish',
      isEnabled: function(isUploading) {
        return ! isUploading;
      },
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
