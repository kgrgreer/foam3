foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactInformation',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is a view used in the contact wizard that lets the user edit a
    contact's information.
  `,

  requires: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Invitation',
    'net.nanopay.ui.LoadingSpinner'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'branchDAO',
    'closeDialog',
    'institutionDAO',
    'invitationDAO',
    'notify',
    'user'
  ],

  css: `
    ^ {
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^ .disclaimer {
      width: 100%;
      height: 56px;

      box-sizing: border-box;
      padding: 18px;
      padding-left: 56px;

      background-color: #ffe2b3;
      border: 1px solid #e49921;
      border-radius: 3px;

      background-repeat: no-repeat;
      background-position-x: 18px;
      background-position-y: 18px;
      background-image: url(images/ic-disclaimer.svg);
    }
    ^ .disclaimer p {
      margin: 0;
    }
    ^ .content {
      padding: 24px;
    }
    ^ .side-by-side {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;
    }
    ^ .field-margin {
      margin-top: 16px;
    }
    ^ .check-margin {
      margin-top: 4px;
    }
    ^ .flex {
      display: flex;
    }
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^ .field-label:first-child {
      margin-top: 0;
    }
    ^ .foam-u2-tag-Input,
    ^ .foam-u2-TextField {
      width: 100%;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .check-box-container {
      margin-top: 16px;
    }
    ^ .divider {
      width: 100%;
      height: 1px;

      margin: 24px 0;
      background-color: #e2e2e3;
    }
    ^ .header {
      margin: 0;

      font-size: 16px;
      font-weight: 900;
    }
    ^ .instructions {
      margin: 0;
      margin-top: 8px;
      line-height: 1.5;
      font-size: 16px;
      color: #8e9090;
    }
    ^ .bank-option-container {
      margin-top: 24px;
    }
    ^ .bankAction {
      height: 44px;
      box-sizing: border-box;

      background-color: white;
      color: #2b2b2b;

      padding: 10px;
      padding-left: 42px;

      text-align: left;

      cursor: pointer;

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
    ^ .check-image {
      width: 100%;
      height: auto;
      margin-top: 24px;
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
    /* Spinner for loading */
    ^ .spinner-container {
      background-color: #ffffff;
      width: 100%;
      height: 100%;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
    }
    ^ .spinner-container-center {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^ .spinner-container .net-nanopay-ui-LoadingSpinner img {
      width: 50px;
      height: 50px;
    }
    ^ .spinner-text {
      font-weight: normal;
      font-size: 12px;
      color: rgba(9, 54, 73, 0.7);
    }

    /*Address View overrides*/
    ^ .label {
      font-size: 12px !important;
      font-weight: 600 !important;
      margin-top: 16px !important;
      margin-bottom: 8px !important;
      line-height: 1.5 !important;
      padding-bottom: 0 !important;
      font-family: 'Lato';
    }
    ^ .left-of-container {
      margin-right: 16px;
    }
    ^ .foam-u2-tag-Select,
    ^ .foam-u2-TextField {
      margin-bottom: 0 !important;
      border: solid 1px #8e9090 !important;
      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^ .foam-u2-tag-Select:focus,
    ^ .foam-u2-TextField:focus {
      border: solid 1px %SECONDARYCOLOR% !important;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isEditing',
      documentation: `
        The user is editing an existing contact, not creating a new one.
      `,
      factory: function() {
        return ! ! this.wizard.data.id;
      }
    },
    {
      class: 'String',
      name: 'title',
      documentation: 'The modal title.',
      expression: function(isEditing) {
        return isEditing ? this.EDIT_TITLE : this.CREATE_TITLE;
      }
    },
    {
      name: 'loadingSpinner',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isConnecting',
      documentation: 'True while waiting for a DAO method call to complete.',
      value: false
    },
    {
      class: 'Boolean',
      name: 'shouldInvite',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      value: false,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Send an email invitation to this client'
      }
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
    }
  ],

  messages: [
    { name: 'CREATE_TITLE', message: 'Add a Contact' },
    { name: 'EDIT_TITLE', message: 'Edit Contact' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'DISCLAIMER', message: 'Added contacts must be businesses, not personal accounts.' },
    { name: 'COMPANY_PLACEHOLDER', message: 'Enter company name' },
    { name: 'HEADER_BANKING', message: 'Banking information' },
    { name: 'INSTRUCTIONS_BANKING', message: 'When adding banking information for a contact, please be sure to double check it, as all future payments will be sent directly to this account.' },
    { name: 'LABEL_CA', message: 'Canada' },
    { name: 'LABEL_US', message: 'US' },
    { name: 'ROUTING', message: 'Routing #' },
    { name: 'INSTITUTION', message: 'Institution #' },
    { name: 'ACCOUNT', message: 'Account #' },
    { name: 'BANK_ADDRESS_TITLE', message: 'Business address' },
    { name: 'CONTACT_ADDED', message: 'Contact added' },
    { name: 'CONTACT_UPDATED', message: 'Contact updated' },
    { name: 'INVITE_SUCCESS', message: 'Invitation sent!' },
    { name: 'INVITE_FAILURE', message: 'There was a problem sending the invitation.' },
    { name: 'EDIT_BANK_ERR', message: 'Error Editing Bank Account. Please try again.' },
    { name: 'ACCOUNT_NOT_FOUND', message: `Could not find contact's bank account.` },
    { name: 'INSTITUTION_NOT_FOUND', message: `Could not find contact's bank account institution.` },
    { name: 'BRANCH_NOT_FOUND', message: `Could not find contact's bank account branch.` }
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
                  this.notify(msg, 'error');
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
                  this.notify(msg, 'error');
                });
            } else {
              this.usAccount.copyFrom(account);
              this.isCABank = false;
            }
            this.isConnecting = false;
          })
          .catch((err) => {
            var msg = err != null && err.message
              ? err.message
              : this.ACCOUNT_NOT_FOUND;
            this.notify(msg, 'error');
            this.isConnecting = false;
          });
      }
    },

    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass('content')
          .start('h2')
            .addClass('popUpTitle')
            .add(this.title$)
          .end()
          .br()
          .start()
            .addClass('spinner-container')
            .show(this.isConnecting$)
            .start()
              .addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p')
                .add(this.CONNECTING)
                .addClass('spinner-text')
              .end()
            .end()
          .end()
          .start()
            .addClass('disclaimer')
            .start('p')
              .add(this.DISCLAIMER)
            .end()
          .end()
          .startContext({ data: this.wizard.data })
            .start('p')
              .addClass('field-label')
              .add(this.wizard.data.ORGANIZATION.label)
            .end()
            .tag(this.wizard.data.ORGANIZATION, {
              placeholder: this.COMPANY_PLACEHOLDER,
              onKey: true
            })
            .start()
              .addClass('field-margin')
              .addClass('side-by-side')
              .start()
                .start('p')
                  .addClass('field-label')
                  .add(this.wizard.data.FIRST_NAME.label)
                .end()
                .tag(this.wizard.data.FIRST_NAME, {
                  placeholder: 'Jane',
                  onKey: true
                })
              .end()
              .start()
                .start('p')
                  .addClass('field-label')
                  .add(this.wizard.data.LAST_NAME.label)
                .end()
                .tag(this.wizard.data.LAST_NAME, {
                  placeholder: 'Doe',
                  onKey: true
                })
              .end()
            .end()
            .start('p')
              .addClass('field-label')
              .add(this.wizard.data.EMAIL.label)
            .end()
            .start()
              .tag(this.wizard.data.EMAIL, {
                mode: foam.u2.DisplayMode.DISABLED
              })
            .end()
          .endContext()
          .start()
            .addClass('check-box-container')
            .add(this.SHOULD_INVITE)
          .end()
          .callIf(this.viewData.isBankingProvided, function() {
            this
              .start()
                .addClass('divider')
              .end()
              .start('p')
                .addClass('header')
                .add(self.BANK_ADDRESS_TITLE)
              .end()
              .startContext({ data: self.wizard.data })
                .tag(self.wizard.data.BUSINESS_ADDRESS)
              .endContext()
              .start()
                .addClass('divider')
              .end()
              .start('p')
                .addClass('header')
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
                          .start('p')
                            .addClass('field-label')
                            .add(self.caAccount.BRANCH_ID.label)
                          .end()
                          .tag(self.caAccount.BRANCH_ID) // Transit number
                        .end()
                        .start()
                          .addClass('institution-container')
                          .start('p')
                            .addClass('field-label')
                            .add(self.caAccount.INSTITUTION_NUMBER.label)
                          .end()
                          .tag(self.caAccount.INSTITUTION_NUMBER)
                        .end()
                        .start()
                          .addClass('account-container')
                          .start('p')
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
                          .start('p')
                            .addClass('field-label')
                            .add(self.usAccount.BRANCH_ID.label)
                          .end()
                          .tag(self.usAccount.BRANCH_ID)
                        .end()
                        .start()
                          .start('p')
                            .addClass('field-label')
                            .add(self.usAccount.ACCOUNT_NUMBER.label)
                          .end()
                          .tag(self.usAccount.ACCOUNT_NUMBER)
                        .end()
                      .end()
                    .endContext();
                }
              }));
          })
        .end()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
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
        return;
      }

      this.isConnecting = false;
    },

    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;

      var contact = this.wizard.data;
      var bankAccount = this.isCABank ? this.caAccount : this.usAccount;

      bankAccount.name = this.wizard.data.organization + ' Contact ' +
        (this.isCABank ? ' CA ' : ' US ') + ' Bank Account';
      bankAccount.owner = this.wizard.data.id;

      try {
        var result = await this.bankAccountDAO.put(bankAccount);
        await this.updateContactBankInfo(contact.id, result.id);
      } catch (err) {
        var msg = err != null && err.message
          ? err.message
          : this.ACCOUNT_CREATION_ERROR;
        this.notify(msg, 'error');
      }

      this.isConnecting = false;
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
    function sendInvite() {
      var invite = this.Invitation.create({
        email: this.wizard.data.email,
        createdBy: this.user.id
      });
      this.invitationDAO
        .put(invite)
        .then(() => {
          this.notify(this.INVITE_SUCCESS);
          this.user.contacts.on.reset.pub(); // Force the view to update.
        })
        .catch((e) => {
          var msg = e != null && e.message ? e.message : this.INVITE_FAILURE;
          this.notify(msg, 'error');
        });
    }
  ],

  actions: [
    {
      name: 'back',
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
        // Validate the contact fields.
        if ( this.wizard.data.errors_ ) {
          this.notify(this.wizard.data.errors_[0][1], 'error');
          return;
        }


        if ( this.viewData.isBankingProvided ) {
          // Validate the contact address fields.
          if ( this.wizard.data.businessAddress.errors_ ) {
            this.notify(this.wizard.data.businessAddress.errors_[0][1], 'error');
            return;
          }

          // Validate the contact bank account fields.
          if ( this.isCABank ) {
            if ( this.caAccount.errors_ ) {
              this.notify(this.caAccount.errors_[0][1], 'error');
              return;
            }
          } else {
            if ( this.usAccount.errors_ ) {
              this.notify(this.usAccount.errors_[0][1], 'error');
              return;
            }
          }

          await this.addContact();
          await this.addBankAccount();
        } else {
          await this.addContact();
        }

        if ( this.shouldInvite ) {
          this.sendInvite();
        }

        this.closeDialog();
      }
    }
  ]
});
