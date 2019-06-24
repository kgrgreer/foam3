foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'AddContactStepThree',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    This is the third step of the adding contact flow to allow user to 
    add related business address for inviting a contact.
  `,

  imports: [
    'accountDAO as bankAccountDAO',
    'addContact',
    'auth',
    'caAccount',
    'closeDialog',
    'countryDAO',
    'ctrl',
    'isCABank',
    'isConnecting',
    'sendInvite',
    'usAccount',
    'user'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^{
      padding: 24px;
    }

    /* Address View overrides */
    ^ .label {
      font-family: 'Lato';
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1 !important;
      margin-top: 16px !important;
      margin-bottom: 8px !important;
      padding-bottom: 0 !important;
    }
    ^ .left-of-container {
      margin-right: 16px;
    }

    ^ .foam-u2-tag-Select,
    ^ .foam-u2-TextField {
      margin-bottom: 0 !important;
    }
  `,

  messages: [
    { name: 'BANKING_TITLE', message: 'Add business address' },
    { name: 'INSTRUCTION', message: 'In order to send payments to this business, we’ll need you to verify their business address below.' },
    { name: 'BUSINESS_ADDRESS_TITLE', message: 'Business address' },
    { name: 'STEP_INDICATOR', message: 'Step 3 of 3' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Address',
      name: 'address_',
      documentation: `Temporarily store the business address when the first
        time saving the new contact into the journal.`
    }
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
          .tag(this.wizard.data.BUSINESS_ADDRESS, {
            customCountryDAO: this.PromisedDAO.create({
              promise: this.auth.check(null, 'currency.read.USD').then((hasPermission) => {
                var q = hasPermission
                  ? this.OR(
                      this.EQ(this.Country.ID, 'CA'),
                      this.EQ(this.Country.ID, 'US')
                    )
                  : this.EQ(this.Country.ID, 'CA');
                return this.countryDAO.where(q);
              })
            })
          })
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
        this.ctrl.notify(msg, 'error');
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

        // Temporarily replace the value of businessAddress property with
        // the empty address object when the first time saving the new contact
        if ( this.wizard.data.bankAccount === 0 ) {
          this.address_ = this.wizard.data.businessAddress;
          this.wizard.data.businessAddress = this.Address.create();
        }

        if ( ! await this.addContact() ) return;

        // Assign the value of the orignal businessAddress property back
        if ( this.wizard.data.bankAccount === 0 ) {
          this.wizard.data.businessAddress = this.address_;
        }

        if ( ! await this.addBankAccount() ) return;
        X.closeDialog();
      }
    }
  ]
});
