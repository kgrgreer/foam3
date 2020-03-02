foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepTwo',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the second step of the adding contact flow to allow user to 
    add banking information for inviting a contact,
  `,

  requires: [
    'net.nanopay.bank.INBankAccount',
    'net.nanopay.bank.CABankAccount'
  ],

  imports: [
    'auth',
    'accountDAO as bankAccountDAO',
    'addContact',
    'bankAdded',
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
    ^ {
      display: flex;
      flex-direction: column;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^container {
      padding: 24px 24px 0;
    }
    ^instruction {
      margin-bottom: 24px;
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
    .Country-label {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 6px;
      margin-top: 24px;
    }
    .contact-bank-account .foam-u2-layout-Grid span {
      display: none;
    }
    .contact-bank-account option[value="-1"] {
      display: none;
    }
    .property-rbiLink {
      margin-top: -33px;
      top: 50px;
      position: relative;
      float: right;
    }
    ^invite {
      display: flex;
      align-items: center;
      font-size: 16px;
      line-height: 1.5;
      margin-top: 16px;
      margin-bottom: 32px;
    }
    ^button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-next {
      min-width: 104px;
      height: 36px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-option {
      background-color: ffffff;
      color: /*%PRIMARY3%*/ #406dea;
      border: 1px solid /*%PRIMARY3%*/ #406dea !important;
      margin-right: 10px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-option:hover {
      background-color: ffffff;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      background-color: transparent;
      border: none;
      padding: 0;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.43;
      margin: 32px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      background-color: transparent;
      color: #4d38e1;
      border: none;
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
    },
    {
      class: 'Boolean',
      name: 'hasStrategyPermission',
      value: false
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
      let permIndia = await this.auth.check(null, 'strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d');
      let permUs = await this.auth.check(null, 'strategyreference.read.a5b4d08c-c1c1-d09d-1f2c-12fe04f7cb6b');
      if ( permIndia || permUs ) {
        this.hasStrategyPermission = true;
      }
    },

    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start().addClass(this.myClass('container'))
          .start().addClass('title-block')
            .start()
              .addClass('contact-title')
              .add(this.BANKING_TITLE)
            .end()
            .start().addClass('step-indicator')
              .add(this.STEP_INDICATOR)
            .end()
          .end()
          .start().hide(this.isEdit$)
            .addClass('instruction')
            .add(this.INSTRUCTION)
          .end()
          .start()
            .show(this.hasStrategyPermission$)
            .addClass('Country-label')
            .add('Country')
          .end()
          .start().enableClass('existing-account', this.viewData.isBankingProvided)
            .start()
            .addClass('contact-bank-account')
              .add(this.slot(function(bankAdded) {
                if ( bankAdded || this.viewData.isBankingProvided ) {
                  return this.E().tag({
                    class: 'foam.u2.detail.SectionedDetailView',
                    of: 'net.nanopay.bank.BankAccount',
                    data$: self.bankAccount$ // Bind value to the property
                  });
                }

                return this.E().tag({
                  class: 'foam.u2.view.FObjectView',
                  of: 'net.nanopay.bank.BankAccount',
                  data$: self.bankAccount$ // Bind value to the property
                });
              }))
            .end()
          .end()
          .startContext({ data: this.wizard })
            .start()
            .hide(this.slot(function(isEdit, bankAccount) {
              return isEdit || this.INBankAccount.isInstance(bankAccount);
            }))
              .start()
                .addClass('divider')
              .end()
              .start()
                .addClass(this.myClass('invite'))
                .add(this.wizard.SHOULD_INVITE)
              .end()
            .end()
          .endContext()
          .start(this.ADDING_BANK_ACCOUNT)
            .addClass(this.myClass('adding-account'))
          .end()
        .end()
        .start().addClass(this.myClass('button-container'))
          .start(this.BACK).end()
          .start().addClass(this.myClass('button-sub-container'))
            .start(this.OPTION).end()
            .start(this.NEXT).end()
          .end()
        .end();
    },

    function validateBank(bankAccount) {
      if ( this.CABankAccount.isInstance(this.bankAccount) && this.bankAccount.institutionNumber == '' ) {
        this.ctrl.notify('Please enter an Inst. No.', 'error');
        return;
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
        this.bankAccount.isDefault = true;
        this.wizard.bankAccount = this.bankAccount;
        this.bankAdded = true;
        X.pushToId('AddContactStepThree');
      }
    }
  ]
});
