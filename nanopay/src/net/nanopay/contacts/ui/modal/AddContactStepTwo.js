foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepTwo',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the second step of the adding contact flow to allow user to 
    add banking information for inviting a contact,
  `,

  imports: [
    'accountDAO as bankAccountDAO',
    'addContact',
    'branchDAO',
    'caAccount',
    'closeDialog',
    'ctrl',
    'institutionDAO',
    'isCABank',
    'isConnecting',
    'isEdit',
    'sendInvite',
    'usAccount',
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
    ^ .net-nanopay-sme-ui-AddressView .label-input .label {
      margin-top: 16px;
      padding-bottom: 0px !important;
    }
    ^ .net-nanopay-sme-ui-AddressView .foam-u2-TextField {
      margin-bottom: 0px !important;
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
      class: 'String',
      name: 'voidCheckPath',
      expression: function(isCABank) {
        return isCABank
          ? 'images/Canada-Check@2x.png'
          : 'images/USA-Check@2x.png';
      }
    }
  ],

  methods: [
    function init() {
      if ( this.viewData.isBankingProvided && this.wizard.data.bankAccount ) {
        this.isConnecting = true;
        this.bankAccountDAO
          .find(this.wizard.data.bankAccount)
          .then((account) => {
            if ( account == null ) {
              throw new Error(`Could not find account with id ${this.wizard.data.bankAccount}.`);
            }
            if ( account.denomination === 'CAD' ) {
              // 1) IF CAD BANK ACCOUNT
              this.caAccount.copyFrom(account);
              this.isCABank = true;

              // Get the institution number since the backend stores them on a
              // different property.
              this.institutionDAO
                .find(account.institution)
                .then((institution) => {
                  if ( institution == null ) {
                    throw new Error(this.INSTITUTION_NOT_FOUND);
                  }
                  this.caAccount.copyFrom({
                    institutionNumber: institution.institutionNumber,
                    // Need to set this to zero otherwise the backend won't
                    // recognize the change in institution.
                    institution: 0
                  });
                })
                .catch((err) => {
                  var msg = err.message || this.INSTITUTION_NOT_FOUND;
                  this.ctrl.notify(msg, 'error');
                });

              // Get the branch number.
              this.branchDAO
                .find(account.branch)
                .then((branch) => {
                  if ( branch == null ) throw new Error(this.BRANCH_NOT_FOUND);
                  this.caAccount.copyFrom({
                    branchId: branch.branchId,
                    // Need to set this to zero otherwise the backend won't
                    // recognize the change in institution.
                    branch: 0
                  });
                })
                .catch((err) => {
                  var msg = err.message || this.BRANCH_NOT_FOUND;
                  this.ctrl.notify(msg, 'error');
                });
            } else {
              // 2) IF US BANK ACCOUNT
              this.usAccount.copyFrom(account);
              this.isCABank = false;
              // Get the routing number (aka branch number).
              this.branchDAO
                .find(account.branch)
                .then((branch) => {
                  if ( branch == null ) throw new Error(this.BRANCH_NOT_FOUND);
                  this.usAccount.copyFrom({
                    branchId: branch.branchId
                  });
                })
                .catch((err) => {
                  var msg = err.message || this.BRANCH_NOT_FOUND;
                  this.ctrl.notify(msg, 'error');
                });
            }
            this.isConnecting = false;
          })
          .catch((err) => {
            var msg = err.message || this.ACCOUNT_NOT_FOUND;
            this.ctrl.notify(msg, 'error');
            this.isConnecting = false;
          });
      }
    },

    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start().addClass('title-block')
          .start()
            .addClass('contact-title')
            .add(this.BANKING_TITLE)
          .end()
          .start().addClass('step-indicator')
            .add(this.STEP_INDICATOR)
          .end()
        .end()
        .start('p')
          .addClass('instruction')
          .add(this.INSTRUCTION)
        .end()
        .start()
          .addClass('bank-option-container')
          .addClass('two-column')
          .show(! this.wizard.data.bankAccount)
          .start(this.SELECT_CABANK)
            .addClass('bankAction')
            .enableClass('selected', this.isCABank$)
            .start('p')
              .add(this.LABEL_CA)
            .end()
          .end()
          .start(this.SELECT_USBANK)
            .addClass('bankAction')
            .enableClass('selected', this.isCABank$, true)
            .start('p')
              .add(this.LABEL_US)
            .end()
          .end()
        .end()
        .start({ class: 'foam.u2.tag.Image', data: self.voidCheckPath$ })
          .addClass('check-image')
        .end()
        .add(this.slot(function(isCABank) {
          if ( isCABank ) {
            return this.E()
              .startContext({ data: self.caAccount })
                .start()
                  .addClass('check-margin')
                  .addClass('flex')
                  .start()
                    .addClass('transit-container')
                    .start()
                      .addClass('field-label')
                      .add(self.caAccount.BRANCH_ID.label)
                    .end()
                    .tag(self.caAccount.BRANCH_ID) // Transit number
                  .end()
                  .start()
                    .addClass('institution-container')
                    .start()
                      .addClass('field-label')
                      .add(self.caAccount.INSTITUTION_NUMBER.label)
                    .end()
                    .tag(self.caAccount.INSTITUTION_NUMBER)
                  .end()
                  .start()
                    .addClass('account-container')
                    .start()
                      .addClass('field-label')
                      .add(self.caAccount.ACCOUNT_NUMBER.label)
                    .end()
                    .tag(self.caAccount.ACCOUNT_NUMBER)
                  .end()
                .end()
                .start()
                  .start()
                    .addClass('field-label')
                    .add(self.NAME_LABEL)
                  .end()
                  .start(self.caAccount.NAME)
                    .setAttribute('placeholder', this.CA_ACCOUNT_NAME_PLACEHOLDER)
                  .end()
                .end()
                .start()
                  .addClass('divider')
                .end()
              .endContext();
          } else {
            return this.E()
              .startContext({ data: self.usAccount })
                .start()
                  .addClass('check-margin')
                  .addClass('two-column')
                  .start()
                    .start()
                      .addClass('field-label')
                      .add(self.LABEL_ACH_ROUTING_LABEL)
                    .end()
                    .tag(self.usAccount.BRANCH_ID)
                  .end()
                  .start()
                    .start()
                      .addClass('field-label')
                      .add(self.LABEL_ACH_ACCOUNT_LABEL)
                    .end()
                    .tag(self.usAccount.ACCOUNT_NUMBER)
                  .end()
                .end()
                .start()
                  .addClass('divider')
                .end()
                .start()
                  .start().addClass('field-label')
                    .add(self.NAME_LABEL)
                  .end()
                  .start(self.usAccount.NAME)
                    .setAttribute('placeholder', this.US_ACCOUNT_NAME_PLACEHOLDER)
                  .end()
                .end()
                .tag(self.usAccount.ADDRESS.clone().copyFrom({
                  view: {
                    class: 'net.nanopay.sme.ui.AddressView',
                    withoutCountrySelection: true
                  }
                }))
              .endContext();
          }
        }))
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

    /** Chooses a CA or US bank account. */
    function selectBank(bank) {
      this.isCABank = bank === 'CA';
    },

    function validateBank(bankAccount, countryId) {
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
        var correctFields;
        if ( this.isCABank ) correctFields = this.validateBank(this.caAccount, 'CA');
        else correctFields = this.validateBank(this.usAccount, 'US');
        if ( ! correctFields ) return;

        // // Validate the contact address fields.
        X.pushToId('AddContactStepThree');
      }
    },
    {
      name: 'selectCABank',
      label: '',
      enabledPermissions: ['currency.read.CAD'],
      code: function() {
        this.selectBank('CA');
      }
    },
    {
      name: 'selectUSBank',
      label: '',
      enabledPermissions: ['currency.read.USD'],
      code: function() {
        this.selectBank('US');
      }
    }
  ]
});
