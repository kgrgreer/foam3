foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepTwo',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the second step of the adding contact flow to allow user to 
    add banking information for inviting a contact,
  `,

  imports: [
    'auth',
    'accountDAO as bankAccountDAO',
    'addContact',
    'branchDAO',
    'closeDialog',
    'ctrl',
    'institutionDAO',
    'isConnecting',
    'isEdit',
    'sendInvite',
    'user'
  ],

  css: `
    ^invite {
      margin-top: 16px;
    }
    ^{
      height: 76vh;
      overflow-y: scroll;
      padding: 24px;
    }
    ^ .check-image {
      height: auto;
      margin-top: 24px;
      width: 100%;
    }
    ^ .check-margin {
      margin-top: 4px;
    }
    ^ .bankAction {
      background-color: white;
      box-sizing: border-box;
      color: /*%BLACK%*/ #1e1f21;
      cursor: pointer;
      height: 44px;
      padding: 10px;
      padding-left: 42px;
      text-align: left;

      border-radius: 4px;
      border: 1px solid #8e9090;
      box-shadow: none;

      background-image: url(images/ablii/radio-resting.svg);
      background-position-x: 18px;
      background-position-y: 13px;
      background-repeat: no-repeat;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .bankAction.selected {
      background-image: url(images/ablii/radio-active.svg);
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    ^ .bankAction:first-child {
      margin-left: 0;
    }
    ^ .bankAction p {
      margin: 0;
      height: 24px;
      line-height: 1.5;
      font-size: 14px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .bankAction:hover {
      background-color: white;
    }
    ^ .bankAction:disabled {
      border: 1px solid #e2e2e3;
    }
    ^ .bankAction:disabled p {
      color: #8e9090;
    }
    ^ .transit-container {
      width: 133px;
      margin-right: 16px;
    }
     ^ .institution-container {
      width: 71px;
      margin-right: 16px;
    }
     ^ .account-container {
      flex-grow: 2;
    }
    ^ .bank-option-container {
      margin-top: 24px;
    }
    ^ .flex {
      display: flex;
    }
    ^adding-account{
      margin-top: 16px;
    }
    ^ .existing-account .property-objectClass {
      pointer-events: none;
    }
  `,

  messages: [
    { name: 'BANKING_TITLE', message: 'Add banking information' },
    { name: 'INSTRUCTION', message: 'Enter the contact’s bank account information.  Please make sure that this is accurate as payments will go directly to the specified account.' },
    { name: 'LABEL_CA', message: 'Canada' },
    { name: 'LABEL_US', message: 'US' },
    { name: 'LABEL_ACH_ROUTING_LABEL', message: 'ACH Routing No.' },
    { name: 'LABEL_ACH_ACCOUNT_LABEL', message: 'ACH Account No.' },
    { name: 'NAME_LABEL', message: 'Financial Institution Name' },
    { name: 'EDIT_BANK_ERR', message: 'Error Editing Bank Account. Please try again.' },
    { name: 'ACCOUNT_NOT_FOUND', message: `Could not find contact's bank account.` },
    { name: 'INSTITUTION_NOT_FOUND', message: `Could not find contact's bank account institution.` },
    { name: 'BRANCH_NOT_FOUND', message: `Could not find contact's bank account branch.` },
    { name: 'STEP_INDICATOR', message: 'Step 2 of 3' },
    { name: 'CA_ACCOUNT_NAME_PLACEHOLDER', message: 'ex. TD Bank, Bank of Montreal' },
    { name: 'US_ACCOUNT_NAME_PLACEHOLDER', message: 'ex. Bank of America, Wells Fargo' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'bankAccount'
    }
  ],

  methods: [
    async function init() {
      if ( this.viewData.isBankingProvided && this.wizard.data.bankAccount ) {
        this.isConnecting = true;
        this.bankAccountDAO
          .find(this.wizard.data.bankAccount)
          .then((account) => {
            if ( account == null ) {
              throw new Error(`Could not find account with id ${this.wizard.data.bankAccount}.`);
            }
            this.bankAccount = account;
            this.isConnecting = false;
          })
          .catch((err) => {
            var msg = err.message || this.ACCOUNT_NOT_FOUND;
            this.ctrl.notify(msg, 'error');
            this.isConnecting = false;
          });
      } else if ( this.wizard.bankAccount ) {
        this.bankAccount = this.wizard.bankAccount;
      }
    },

    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start().enableClass('existing-account', this.viewData.isBankingProvided)
          .start(this.BANK_ACCOUNT).end()
        .end()
        .startContext({ data: this.wizard })
          .start()
            .hide(this.isEdit)
            .addClass(this.myClass('invite'))
            .add(this.wizard.SHOULD_INVITE)
          .end()
        .endContext()
        .start(this.ADDING_BANK_ACCOUNT)
          .addClass(this.myClass('adding-account'))
        .end()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          option: this.OPTION,
          next: this.NEXT
        });
    },

    function validateBank(bankAccount) {
      if ( ! bankAccount.name ) {
        this.ctrl.notify('Financial institution name is required', 'error');
        return false;
      }
      try {
        bankAccount.validate();
      } catch (e) {
        if ( bankAccount.errors_ ) {
          this.ctrl.notify(bankAccount.errors_[0][1], 'error');
          return false;
        }
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        if ( X.subStack.depth > 1 ) {
          X.subStack.back();
        } else {
          X.closeDialog();
        }
      }
    },
    {
      name: 'option',
      label: 'Save without banking',
      isAvailable: function() {
        return ! this.wizard.data.bankAccount;
      },
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: function(X) {
        // Validate the contact bank account fields.
        if ( ! this.validateBank(this.bankAccount) ) return;
        this.wizard.bankAccount = this.bankAccount;
        X.pushToId('AddContactStepThree');
      }
    }
  ]
});
