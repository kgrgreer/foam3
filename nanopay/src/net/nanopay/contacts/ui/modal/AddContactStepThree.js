foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepThree',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    This is the third step of the adding contact flow to allow user to 
    add related business address for inviting a contact.
  `,

  imports: [
    'accountDAO as bankAccountDAO',
    'addContact',
    'caAccount',
    'ctrl',
    'closeDialog',
    'isCABank',
    'isConnecting',
    'sendInvite',
    'usAccount',
    'user'
  ],

  css: `
    ^{
      padding: 24px;
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

  messages: [
    { name: 'BANKING_TITLE', message: 'Add banking information' },
    { name: 'INSTRUCTION', message: 'In order to send payments to this business, we’ll need you to verify their business address below.' },
    { name: 'BUSINESS_ADDRESS_TITLE', message: 'Business address' },
    { name: 'STEP_INDICATOR', message: 'Step 3 of 3' }
  ],

  methods: [
    function initE() {
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
        .startContext({ data: this.wizard.data })
          .tag(this.wizard.data.BUSINESS_ADDRESS)
        .endContext()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          next: this.NEXT
        });
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
        await this.updateContactBankInfo(contact, result.id);
      } catch (err) {
        var msg = err.message || this.ACCOUNT_CREATION_ERROR;
        this.ctrl.notify(msg, 'error');
        return false;
      }

      this.isConnecting = false;
      return true;
    },

    /** Sets the reference from the Contact to the Bank Account.  */
    async function updateContactBankInfo(contact, bankAccountId) {
      try {
        contact.bankAccount = bankAccountId;
        await this.user.contacts.put(contact);
      } catch (err) {
        var msg = err.message || this.GENERIC_PUT_FAILED;
        this.notify(msg, 'error');
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
      name: 'next',
      label: 'Save',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: async function(X) {
        // Validate the contact address fields.
        var businessAddress = this.wizard.data.businessAddress;
        if ( businessAddress.errors_ ) {
          this.ctrl.notify(businessAddress.errors_[0][1], 'error');
          return;
        }

        if ( ! await this.addContact() ) return;
        if ( ! await this.addBankAccount() ) return;

        if ( this.wizard.shouldInvite ) {
          if ( ! await this.sendInvite() ) return;
        }
        X.closeDialog();
      }
    }
  ]
});
