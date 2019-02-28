foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepTwo',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is a view used in the contact wizard that lets the user add or edit a
    external user's business name and contact information.
  `,

  requires: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'branchDAO',
    'closeDialog',
    'institutionDAO',
    'invitationDAO',
    'notify',
    'regionDAO',
    'user',
    'validatePostalCode',
    'validateStreetNumber',
    'validateCity',
    'validateAddress'
  ],

  css: `
    ^ .content {
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
    ^ .instructions {
      color: #8e9090;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      margin-top: 8px;
    }
    ^ .flex {
      display: flex;
    }
    ^ .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar-container {
      background-color: #ffffff;
    }
    ^ .net-nanopay-ui-ActionView-back {
      float: left;
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
    { name: 'HEADER_BANKING', message: 'Banking information' },
    { name: 'INSTRUCTIONS_BANKING', message: 'When adding banking information for a contact, please be sure to double check it, as all future payments will be sent directly to this account.' },
    { name: 'LABEL_CA', message: 'Canada' },
    { name: 'LABEL_US', message: 'US' },
    { name: 'BANK_ADDRESS_TITLE', message: 'Business address' },
    { name: 'CONTACT_ADDED', message: 'Contact added' },
    { name: 'CONTACT_UPDATED', message: 'Contact updated' },
    { name: 'INVITE_SUCCESS', message: 'Invitation sent!' },
    { name: 'INVITE_FAILURE', message: 'There was a problem sending the invitation.' },
    { name: 'EDIT_BANK_ERR', message: 'Error Editing Bank Account. Please try again.' },
    { name: 'ACCOUNT_NOT_FOUND', message: `Could not find contact's bank account.` },
    { name: 'INSTITUTION_NOT_FOUND', message: `Could not find contact's bank account institution.` },
    { name: 'BRANCH_NOT_FOUND', message: `Could not find contact's bank account branch.` },
    { name: 'ERROR_COUNTRY', message: 'Please select a country.' },
    { name: 'ERROR_REGION', message: 'Please select a state/province.' },
    { name: 'ERROR_STREET_NUMBER', message: 'Invalid street number.' },
    { name: 'ERROR_STREET_NAME', message: 'Invalid street name.' },
    { name: 'ERROR_CITY', message: 'Invalid city name.' },
    { name: 'ERROR_POSTAL', message: 'Invalid postal/zip code.' }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'FObjectProperty',
      name: 'caAccount',
      documentation: `The contact's bank account if they choose CA.`,
      factory: function() {
        return this.CABankAccount.create({
          status: this.BankAccountStatus.VERIFIED,
          denomination: 'CAD'
        });
      }
    },
    {
      class: 'FObjectProperty',
      name: 'usAccount',
      documentation: `The contact's bank account if they choose US.`,
      factory: function() {
        return this.USBankAccount.create({
          status: this.BankAccountStatus.VERIFIED,
          denomination: 'USD'
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isCABank',
      documentation: `True if working with a CA bank account, otherwise US.`,
      value: true
    },
    {
      class: 'String',
      name: 'voidCheckPath',
      expression: function(isCABank) {
        return isCABank
          ? 'images/Canada-Check@2x.png'
          : 'images/USA-Check@2x.png';
      }
    },
    {
      class: 'Boolean',
      name: 'addingBankAccount',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      value: true,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Add contact without banking information'
      },
      expression: function() {
        
      }
    },
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
        .start()
          .addClass('content')
          .start().addClass('contact-title')
            .add(self.HEADER_BANKING)
          .end()
          .start('p')
            .addClass('instructions')
            .add(self.INSTRUCTIONS_BANKING)
          .end()
          .start()
            .addClass('bank-option-container')
            .addClass('side-by-side')
            .show(! self.wizard.data.bankAccount)
            .start()
              .addClass('bankAction')
              .enableClass('selected', self.isCABank$)
              .start('p')
                .add(self.LABEL_CA)
              .end()
              .on('click', function() {
                self.selectBank('CA');
              })
            .end()
            .start()
              .addClass('bankAction')
              .enableClass('selected', self.isCABank$, true)
              .start('p').add(self.LABEL_US).end()
              .on('click', function() {
                self.selectBank('US');
              })
            .end()
          .end()
          .add(self.slot(function(isCABank) {
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
          next: this.NEXT
        })
      .end();
    },

    /** Chooses a CA or US bank account. */
    function selectBank(bank) {
      if ( bank === 'CA' ) {
        this.isCABank = true;
      } else if ( bank === 'US' ) {
        this.isCABank = false;
      }
    },

    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;

      try {
        this.wizard.data = await this.user.contacts.put(this.wizard.data);
        if ( this.isEditing ) {
          this.notify(this.CONTACT_UPDATED);
        } else {
          this.notify(this.CONTACT_ADDED);
        }
      } catch (e) {
        var msg = e != null && e.message ? e.message : this.GENERIC_PUT_FAILED;
        this.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }

      this.isConnecting = false;
      return true;
    },

    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;

      var contact = this.wizard.data;
      var bankAccount = this.isCABank ? this.caAccount : this.usAccount;

      bankAccount.name = this.wizard.data.organization + ' Contact' +
        (this.isCABank ? ' CA ' : ' US ') + 'Bank Account';
      bankAccount.owner = this.wizard.data.id;

      try {
        var result = await this.bankAccountDAO.put(bankAccount);
        await this.updateContactBankInfo(contact.id, result.id);
      } catch (err) {
        var msg = err != null && err.message
          ? err.message
          : this.ACCOUNT_CREATION_ERROR;
        this.notify(msg, 'error');
        return false;
      }

      this.isConnecting = false;
      return true;
    },

    /** Sets the reference from the Contact to the Bank Account.  */
    async function updateContactBankInfo(contactId, bankAccountId) {
      try {
        var contact = this.wizard.data;
        contact.bankAccount = bankAccountId;
        await this.user.contacts.put(contact);
      } catch (err) {
        var msg = err != null && err.message
          ? err.message
          : this.GENERIC_PUT_FAILED;
        this.notify(msg, 'error');
      }
    },

    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite() {
      var invite = this.Invitation.create({
        email: this.wizard.data.email,
        createdBy: this.user.id
      });

      try {
        this.invitationDAO.put(invite);
        this.notify(this.INVITE_SUCCESS);
        this.user.contacts.on.reset.pub(); // Force the view to update.
      } catch (e) {
        var msg = e != null && e.message ? e.message : this.INVITE_FAILURE;
        this.notify(msg, 'error');
        return false;
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
      name: 'next',
      label: 'Save',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: async function(X) {
        if ( this.viewData.isBankingProvided ) {
          // Validate the contact address fields.
          var businessAddress = this.wizard.data.businessAddress;
          if ( ! businessAddress.countryId ) {
            this.ctrl.notify( this.ERROR_COUNTRY, 'error' );
            return;
          }
          if ( ! businessAddress.regionId ) {
            this.ctrl.notify( this.ERROR_REGION, 'error' );
            return;
          }
          // This is to check the region when country selection has
          // changed after a previous region selection has been made.
          var validRegion = await this.regionDAO.find(businessAddress.regionId);
          if ( validRegion.countryId != businessAddress.countryId ) {
            this.ctrl.notify( this.ERROR_REGION, 'error' );
            return;
          }
          if ( ! this.validateStreetNumber(businessAddress.streetNumber) ) {
            this.ctrl.notify( this.ERROR_STREET_NUMBER, 'error' );
            return;
          }
          if ( ! this.validateAddress(businessAddress.streetName) ) {
            this.ctrl.notify( this.ERROR_STREET_NAME, 'error' );
            return;
          }
          if ( businessAddress.suite.length > 0 && ! this.validateAddress(businessAddress.suite) ) {
            this.ctrl.notify( this.ERROR_STREET_NAME, 'error' );
            return;
          }
          if ( ! this.validateCity(businessAddress.city) ) {
            this.ctrl.notify( this.ERROR_CITY, 'error' );
            return;
          }
          if ( ! this.validatePostalCode(businessAddress.postalCode, businessAddress.countryId) ) {
            this.ctrl.notify( this.ERROR_POSTAL, 'error' );
            return;
          }

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

          if ( ! await this.addContact() ) return;
          if ( ! await this.addBankAccount() ) return;
        } else {
          if ( ! await this.addContact() ) return;
        }

        if ( this.shouldInvite ) {
          if ( ! await this.sendInvite() ) return;
        }
      }
    }
  ]
});
