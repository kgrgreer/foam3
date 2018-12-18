foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactInformation',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation',
    'net.nanopay.ui.LoadingSpinner'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'invitationDAO',
    'notify',
    'user'
  ],

  css: `
    ^ {
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^ .title {
      padding-left: 25px;
      font-size: 24px;
      font-weight: 900;
      color: #2b2b2b;
      margin: 0;
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
      padding: 0 25px;
      padding-bottom: 25px;
    }
    ^ .half-field-container {
      width: 220px;
      margin-left: 16px;
      display: inline-block;
    }
    ^ .field-margin {
      margin-top: 16px;
    }
    ^ .check-margin {
      margin-top: 4px;
    }
    ^ .half-field-container:first-child {
      margin-left: 0;
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
    ^ .field-container {
      display: inline-block;
      vertical-align: top;
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
      width: 220px;
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
    ^ .half-container {
      width: 220px;
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
      name: 'isEdit',
      factory: function() {
        return this.wizard.data.id;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditBank',
      documentation: `When Contact has a bankAccount that can not be changed.
      Has an invoice associated with this Account`,
      factory: function() {
        return this.wizard.data && this.viewData.contactAccount;
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
      name: 'invite',
      factory: function() {
        return false;
      },
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Send an email invitation to this client'
      }
    },
    {
      class: 'String',
      name: 'transitNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '12345',
        maxLength: 5,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      factory: function() {
        return this.isEdit &&
        this.isEditBank &&
        foam.util.equals(this.viewData.contactAccount.denomination, 'CAD') ?
          this.viewData.contactAccount.branchId : '';
      }
    },
    {
      class: 'String',
      name: 'routingNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123456789',
        maxLength: 9,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      factory: function() {
        return this.isEdit &&
        this.isEditBank &&
        foam.util.equals(this.viewData.contactAccount.denomination, 'USD') ?
          this.viewData.contactAccount.branchId : '';
      }
    },
    {
      class: 'String',
      name: 'institutionNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '123',
        maxLength: 3,
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      factory: function() {
        return this.isEdit &&
        this.isEditBank &&
        foam.util.equals(this.viewData.contactAccount.denomination, 'CAD') ?
          this.viewData.contactAccount.institutionNumber: '';
      }
    },
    {
      class: 'String',
      name: 'accountNumber',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: '1234567',
        onKey: true
      },
      preSet: function(o, n) {
        if ( n === '' ) return n;
        var reg = /^\d+$/;
        return reg.test(n) ? n : o;
      },
      factory: function() {
        return this.isEdit && this.isEditBank ?
          this.viewData.contactAccount.accountNumber : '';
      }
    },
    {
      class: 'Boolean',
      name: 'isCADBank',
      factory: function() {
        // default is true
        return this.isEditBank && foam.util.equals(this.viewData.contactAccount.denomination, 'USD') ? false : true;
      }
    },
    {
      class: 'String',
      name: 'voidCheckPath',
      expression: function(isCADBank) {
        return isCADBank ? 'images/Canada-Check@2x.png' : 'images/USA-Check@2x.png';
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Add a Contact' },
    { name: 'TITLE_2', message: 'Edit Contact' },
    { name: 'CONNECTING', message: 'Connecting... This may take a few minutes.' },
    { name: 'DISCLAIMER', message: 'Added contacts must be businesses, not personal accounts.' },
    { name: 'COMPANY_PLACEHOLDER', message: 'Enter company name' },
    { name: 'HEADER_BANKING', message: 'Banking information' },
    { name: 'INSTRUCTIONS_BANKING', message: 'When adding banking information for a contact, please be sure to double check it, as all future payments will be sent directly to this account.' },
    { name: 'LABEL_CA', message: 'Canada' },
    { name: 'LABEL_US', message: 'US' },
    { name: 'TRANSIT', message: 'Transit #' },
    { name: 'ROUTING', message: 'Routing #' },
    { name: 'INSTITUTION', message: 'Institution #' },
    { name: 'ACCOUNT', message: 'Account #' },
    { name: 'BANK_ADDRESS_TITLE', message: 'Business address' },
    { name: 'CONTACT_ADDED', message: 'Contact added' },
    { name: 'INVITE_SUCCESS', message: 'Invitation sent!' },
    { name: 'INVITE_FAILURE', message: 'There was a problem sending the invitation.' },
    { name: 'EDIT_BANK_ERR', message: 'Error Editing Bank Account. Please try again.' },
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass('title')
          .callIf(! this.isEdit, function() {
            this.start('p').add(self.TITLE).end();
          })
          .callIf(this.isEdit, function() {
            this.start('p').add(self.TITLE_2).end();
          })
        .end()
        .start()
          .addClass('content')
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
              .start()
                .addClass('half-field-container')
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
                .addClass('half-field-container')
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
            .add(this.INVITE)
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
                .show(! self.isEdit)
                .start()
                  .addClass('half-field-container')
                  .addClass('bankAction')
                  .enableClass('selected', self.isCADBank$)
                  .start('p')
                    .add(self.LABEL_CA)
                  .end()
                  .on('click', function() {
                    self.selectBank('CA');
                  })
                .end()
                .start()
                  .addClass('half-field-container')
                  .addClass('bankAction')
                  .enableClass('selected', self.isCADBank$, true)
                  .start('p').add(self.LABEL_US).end()
                  .on('click', function() {
                    self.selectBank('US');
                  })
                .end()
              .end()
              .add(self.slot(function(isCADBank) {
                if ( isCADBank ) {
                  return this.E()
                    .start({ class: 'foam.u2.tag.Image', data: self.voidCheckPath })
                      .addClass('check-image')
                    .end()
                    .start()
                      .addClass('check-margin')
                      .start()
                        .addClass('field-container')
                        .addClass('transit-container')
                        .start('p')
                          .addClass('field-label')
                          .add(self.TRANSIT)
                        .end()
                        .tag(self.TRANSIT_NUMBER)
                      .end()
                      .start()
                        .addClass('field-container')
                        .addClass('institution-container')
                        .start('p')
                          .addClass('field-label')
                          .add(self.INSTITUTION)
                        .end()
                        .tag(self.INSTITUTION_NUMBER)
                      .end()
                      .start()
                        .addClass('field-container')
                        .addClass('account-container')
                        .start('p')
                          .addClass('field-label')
                          .add(self.ACCOUNT)
                        .end()
                        .tag(self.ACCOUNT_NUMBER)
                      .end()
                    .end();
                } else {
                  return this.E()
                    .start({ class: 'foam.u2.tag.Image', data: self.voidCheckPath })
                      .addClass('check-image')
                    .end()
                    .start()
                      .addClass('check-margin')
                      .start()
                        .addClass('half-field-container')
                        .start('p')
                          .addClass('field-label')
                          .add(self.ROUTING)
                        .end()
                        .tag(self.ROUTING_NUMBER)
                      .end()
                      .start()
                        .addClass('half-field-container')
                        .start('p')
                          .addClass('field-label')
                          .add(self.ACCOUNT)
                        .end()
                        .tag(self.ACCOUNT_NUMBER)
                      .end()
                    .end();
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

    function selectBank(bank) {
      if ( bank === 'CA' ) {
        this.isCADBank = true;
      } else if ( bank === 'US' ) {
        this.isCADBank = false;
      }
    },

    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;

      try {
        this.wizard.data = await this.user.contacts.put(this.wizard.data);
        this.notify(this.CONTACT_ADDED);
      } catch (e) {
        var msg = e != null && e.message ? e.message : this.GENERIC_PUT_FAILED;
        this.notify(msg, 'error');
        this.isConnecting = false;
        return;
      }

      if ( this.viewData.isBankingProvided ) {
        await this.addBankAccount();
      }

      this.isConnecting = false;
    },

    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      var contact = this.wizard.data;
      var bankAccount = null;

      if ( this.isCADBank ) {
        bankAccount = this.CABankAccount.create({
          institutionNumber: this.institutionNumber,
          branchId: this.transitNumber,
          accountNumber: this.accountNumber,
          name: contact.organization + '_ContactCABankAccount',
          status: this.BankAccountStatus.VERIFIED,
          owner: contact.id
        });
      } else {
        bankAccount = this.USBankAccount.create({
          branchId: this.routingNumber,
          accountNumber: this.accountNumber,
          name: contact.organization + '_ContactUSBankAccount',
          status: this.BankAccountStatus.VERIFIED,
          denomination: 'USD',
          owner: contact.id
        });
      }

      if ( this.isEdit ) {
        bankAccount.id = contact.bankAccount;
      }

      try {
        var result = await this.bankAccountDAO.put(bankAccount);
        await this.updateContactBankInfo(contact.id, result.id);
      } catch (err) {
        var msg = err != null && err.message
          ? err.message
          : this.ACCOUNT_CREATION_ERROR;
        this.notify(msg, 'error');
      }
    },

    /** Sets the reference from the Contact to the Bank Account.  */
    async function updateContactBankInfo(contactId, bankAccountId) {
      try {
        var contact = await this.user.contacts.find(contactId);
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
        email: this.viewData.email,
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
      label: 'Back',
      code: function(X) {
        X.subStack.back();
      }
    },
    {
      name: 'next',
      label: 'Connect',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: async function(X) {
        // Validate the contact fields.
        if ( this.wizard.data.errors_ ) {
          this.notify(this.wizard.data.errors_[0][1], 'error');
          return;
        }

        // Validate the contact address fields.
        if ( this.wizard.data.businessAddress.errors_ ) {
          this.notify(this.wizard.data.businessAddress.errors_[0][1], 'error');
          return;
        }

        await this.addContact();

        if ( this.invite ) {
          this.sendInvite();
        }

        this.closeDialog();
      }
    }
  ]
});
