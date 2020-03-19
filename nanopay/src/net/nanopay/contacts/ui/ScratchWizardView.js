foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'ScratchWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: `
    Lets user create a contact from scratch.
  `,

  requires: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'ctrl',
    'invitationDAO',
    'user'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    .step-indicator {
      display: flex;
      justify-content: flex-end;
    }
    ^section-container {
      padding: 24px 24px 32px;
    }
    .divider {
      background-color: #e2e2e3;
      height: 1px;
      margin: 12px 0;
      width: 100%;
    }
    .disclaimer {
      font-size: 16px;
      color: #525455;
    }
    .foam-u2-CheckBox-label span {
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      line-height: 1.5;
    }
    ^button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    .net-nanopay-sme-ui-AbliiActionView-tertiary:focus:not(:hover),
    .net-nanopay-sme-ui-AbliiActionView-primary:focus:not(:hover) {
      border-color: transparent;
    }
    .foam-u2-tag-Input, .foam-u2-view-StringView {
      width: 100%;
    }

  `,

  messages: [
    { name: 'CONTACT_ADDED', message: 'Personal contact added.' },
    { name: 'CONTACT_UPDATED', message: 'Personal contact updated.' },
    { name: 'INVITE_SUCCESS', message: 'Sent a request to connect.' },
    { name: 'CONTACT_ADDED_INVITE_SUCCESS', message: 'Personal contact added.  An email invitation was sent.' },
    { name: 'INVITE_FAILURE', message: 'There was a problem sending the invitation.' }
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
      of: 'net.nanopay.contacts.Contact',
      name: 'contact',
      documentation: 'The added contact.'
    }
  ],
  
  methods: [
    function initE() {
      var self = this;

      this.addClass(this.myClass());
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass(self.myClass('section-container'))
              .start().addClass('step-indicator')
                .add(this.slot(function(currentIndex) {
                  return `Step ${currentIndex + 1} of 3`
                }))
              .end()
              .tag(self.sectionView, {
                section: sections[currentIndex],
                data$: self.data$
              });
          }))
          .startContext({ data: this })
            .start().addClass(this.myClass('button-container'))
              .tag(this.BACK, { buttonStyle: 'TERTIARY' })
              .start().addClass(this.myClass('button-sub-container'))
                .tag(this.OPTION, { buttonStyle: 'SECONDARY' })
                .start(this.NEXT).end()
              .end()
              .start(this.SAVE).end()
            .end()
          .endContext()
        .end();
    },

    /** Add the contact to the user's contacts. */
    async function addContact(bankAccountSet) {
      this.isConnecting = true;
      var contact = this.Contact.create({
        type: 'Contact',
        group: 'sme',
        organization: this.data.organization,
        email: this.data.email,
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        businessAddress: bankAccountSet ? this.data.businessAddress : ''
      });
      try {
      contact = await this.user.contacts.put(contact);
        if ( this.data.shouldInvite ) {
          try {
            await this.sendInvite(false, contact.id);
            this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS);
          } catch (err) {
            var msg = err.message || this.GENERIC_PUT_FAILED;
            this.ctrl.notify(msg, 'error');
          }
        } else {
          this.ctrl.notify(this.CONTACT_ADDED);
      }
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }
      this.isConnecting = false;
      this.contact = contact;
      return true;
    },

    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite(showToastMsg, inviteeId) {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id,
        inviteeId: inviteeId,
        businessName: this.data.organization,
        message: ''
      });
      try {
        this.invitationDAO.put(invite);
        if ( showToastMsg ) {
          this.ctrl.notify(this.INVITE_SUCCESS);
        }
        // Force the view to update.
        this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
      } catch (e) {
        var msg = e.message || this.INVITE_FAILURE;
        this.ctrl.notify(msg, 'error');
        return false;
      }

      return true;
    },

    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;
      var contact = this.contact;
      var bankAccount = this.data.bankAccount;
      bankAccount.owner = contact.id;

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
        if ( this.currentIndex > 0 ) {
          this.currentIndex = this.prevIndex;
        } else {
          //How do i get back to MenuToolBar??
          X.pushMenu('sme.main.contacts');
          X.closeDialog();
        }
      }
    },
    {
      name: 'option',
      label: 'Save without banking',
      isAvailable: function(currentIndex) {
        return currentIndex === 1;
      },
      code: async function(X) {
        if ( ! await this.addContact(false) ) return;
        X.pushMenu('sme.main.contacts');
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(data$errors_, data$bankAccount$errors_, currentIndex) {
        if ( currentIndex === 1 ) return ! data$bankAccount$errors_;
        return ! data$errors_;
      },
      isAvailable: function(nextIndex) {
        return nextIndex !== -1;
      },
      code: function() { 
        this.currentIndex = this.nextIndex;
      }
    },
    {
      name: 'save',
      label: 'Save',
      isEnabled: function(data$businessAddress$errors_, isConnecting) {
        return ! data$businessAddress$errors_ && ! isConnecting;
      },
      isAvailable: function(nextIndex) {
        return nextIndex === -1;
      },
      code: async function(X) { 
        if ( ! await this.addContact(true) ) return;
        if ( ! await this.addBankAccount() ) return;
        X.pushMenu('sme.main.contacts');
        X.closeDialog();
      }
    }
  ]
});