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
    ^{
      padding: 24px;
    }
    ^ .check-image {
      width: 100%;
      height: auto;
      margin-top: 24px;
    }
    ^ .check-margin {
      margin-top: 4px;
    }
    ^ .bankAction {
      background-color: white;
      box-sizing: border-box;
      color: #2b2b2b;
      cursor: pointer;
      height: 44px;
      padding: 10px;
      padding-left: 42px;
      text-align: left;

      border-radius: 4px;
      border: 1px solid #8e9090;
      box-shadow: none;

      background-repeat: no-repeat;
      background-position-x: 18px;
      background-position-y: 13px;

      background-image: url(images/ablii/radio-resting.svg);

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .bankAction.selected {
      background-image: url(images/ablii/radio-active.svg);
      border: 1px solid %SECONDARYCOLOR%;
    }
    ^ .bankAction:first-child {
      margin-left: 0;
    }
    ^ .bankAction p {
      margin: 0;
      height: 24px;
      line-height: 1.5;
      font-size: 14px;
      color: #2b2b2b;
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
    ^ .side-by-side {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;
    }
    ^ .flex {
      display: flex;
    }
    ^ .field-label {
      font-size: 12px;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    ^adding-account{
      margin-top: 16px;
    }
  `,

  messages: [
    { name: 'BANKING_TITLE', message: 'Add banking information' },
    { name: 'INSTRUCTION', message: 'Enter the banking information for this business.  Please make sure that this is accurate as payments will go directly to the specified account.' },
    { name: 'LABEL_CA', message: 'Canada' },
    { name: 'LABEL_US', message: 'US' },
    { name: 'ROUTING', message: 'Routing #' },
    { name: 'INSTITUTION', message: 'Institution #' },
    { name: 'ACCOUNT', message: 'Account #' },
    { name: 'EDIT_BANK_ERR', message: 'Error Editing Bank Account. Please try again.' },
    { name: 'ACCOUNT_NOT_FOUND', message: `Could not find contact's bank account.` },
    { name: 'INSTITUTION_NOT_FOUND', message: `Could not find contact's bank account institution.` },
    { name: 'BRANCH_NOT_FOUND', message: `Could not find contact's bank account branch.` }
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
                  var msg = err != null && err.message
                    ? err.message
                    : this.INSTITUTION_NOT_FOUND;
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
                  var msg = err != null && err.message
                    ? err.message
                    : this.BRANCH_NOT_FOUND;
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
                  var msg = err != null && err.message
                    ? err.message
                    : this.BRANCH_NOT_FOUND;
                  this.ctrl.notify(msg, 'error');
                });
            }
            this.isConnecting = false;
          })
          .catch((err) => {
            var msg = err != null && err.message
              ? err.message
              : this.ACCOUNT_NOT_FOUND;
            this.ctrl.notify(msg, 'error');
            this.isConnecting = false;
          });
      }
    },

    function initE() {
      var self = this;

      this.addClass(this.myClass())
        .start().addClass('contact-title')
          .add(this.BANKING_TITLE)
        .end()
        .start('p')
          .addClass('instruction')
          .add(this.INSTRUCTION)
        .end()
        .start()
          .addClass('bank-option-container')
          .addClass('side-by-side')
          .show(! this.wizard.data.bankAccount)
          .start()
            .addClass('bankAction')
            .enableClass('selected', this.isCABank$)
            .start('p')
              .add(this.LABEL_CA)
            .end()
            .on('click', function() {
              self.selectBank('CA');
            })
          .end()
          .start()
            .addClass('bankAction')
            .enableClass('selected', this.isCABank$, true)
            .start('p').add(this.LABEL_US).end()
            .on('click', function() {
              self.selectBank('US');
            })
          .end()
        .end()
        .add(this.slot(function(isCABank) {
          if ( isCABank ) {
            return this.E()
              .start({ class: 'foam.u2.tag.Image', data: self.voidCheckPath })
                .addClass('check-image')
              .end()
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
              .endContext();
          } else {
            return this.E()
              .start({ class: 'foam.u2.tag.Image', data: self.voidCheckPath })
                .addClass('check-image')
              .end()
              .startContext({ data: self.usAccount })
                .start()
                  .addClass('check-margin')
                  .addClass('side-by-side')
                  .start()
                    .start()
                      .addClass('field-label')
                      .add(self.usAccount.BRANCH_ID.label)
                    .end()
                    .tag(self.usAccount.BRANCH_ID)
                  .end()
                  .start()
                    .start()
                      .addClass('field-label')
                      .add(self.usAccount.ACCOUNT_NUMBER.label)
                    .end()
                    .tag(self.usAccount.ACCOUNT_NUMBER)
                  .end()
                .end()
              .endContext();
          }
        }))
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
      if ( bank === 'CA' ) {
        this.isCABank = true;
      } else if ( bank === 'US' ) {
        this.isCABank = false;
      }
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
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        if ( this.wizard.shouldInvite ) {
          if ( ! await this.sendInvite() ) return;
        }
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: async function(X) {
        // Validate the contact bank account fields.
        if ( this.isCABank ) {
          if ( this.caAccount.errors_ ) {
            this.ctrl.notify(this.caAccount.errors_[0][1], 'error');
            return;
          }
        } else {
          if ( this.usAccount.errors_ ) {
            this.ctrl.notify(this.usAccount.errors_[0][1], 'error');
            return;
          }
        }
        X.pushToId('AddContactStepThree');
      }
    }
  ]
});
