foam.CLASS({
  package: 'net.nanopay.contacts.ui',
  name: 'ContactWizardView',
  extends: 'foam.u2.detail.WizardSectionsView',

  documentation: 'Lets the user create a contact from scratch.',

  requires: [
    'foam.u2.ControllerMode',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
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
    ^step-indicator {
      display: flex;
      justify-content: flex-end;
    }
    .property-rbiLink {
      margin-top: -33px;
      top: 50px;
      position: relative;
      float: right;
    }
  `,

  messages: [
    { name: 'EDIT_STEP_ONE_TITLE', message: 'Edit contact' },
    { name: 'EDIT_STEP_TWO_TITLE', message: 'Edit banking information' },
    { name: 'EDIT_STEP_THREE_TITLE', message: 'Edit business address' },
    { name: 'CONTACT_ADDED', message: 'Personal contact added.' },
    { name: 'CONTACT_EDITED', message: 'Personal contact edited.' },
    { name: 'INVITE_SUCCESS', message: 'Sent a request to connect.' },
    { name: 'CONTACT_ADDED_INVITE_SUCCESS', message: 'Personal contact added. An email invitation was sent.' },
    { name: 'CONTACT_ADDED_INVITE_FAILURE', message: 'Personal contact added. An email invitation could not be sent.' }
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
      documentation: 'The contact returned after put to contactDAO.'
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `Set to true when editing a contact from
      contact controller.`,
      value: false
    }
  ],
  
  methods: [
    async function init() {
      // filter out inherited sections
      this.sections = this.sections.filter((section) => section.fromClass === 'Contact');
      this.data.copyFrom({
        type: 'Contact',
        group: 'sme'
      });
      if ( this.isEdit ) {
        this.data.isEdit = true;
        this.data.shouldInvite = false;
        this.sections[0].title = this.EDIT_STEP_ONE_TITLE;
        this.sections[0].subTitle = '';
        this.sections[1].title = this.EDIT_STEP_TWO_TITLE;
        this.sections[1].subTitle = '';
        this.sections[2].title = this.EDIT_STEP_THREE_TITLE;
        this.sections[2].subTitle = '';
        if ( this.data.bankAccount > 0 ){
          this.data.createBankAccount = await this.bankAccountDAO.find(this.data.bankAccount);
        }
      }
    },
    function initE() {
      var self = this;
      this.addClass('wizard');
      self
        .start(self.Rows)
          .add(self.slot(function(sections, currentIndex) {
            return self.E().addClass('section-container')
              .start().addClass(self.myClass('step-indicator'))
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
            .start().addClass('button-container')
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
    async function addContact() {
      this.isConnecting = true;
      try {
        this.contact = await this.user.contacts.put(this.data);
        let canInvite = this.data.createBankAccount.country != 'IN';
        if ( this.data.shouldInvite && canInvite ) {
          try {
            if ( await this.sendInvite(false) ) {
              this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS);
            }
          } catch (err) {
            var msg = err.message || this.GENERIC_PUT_FAILED;
            this.ctrl.notify(msg, 'error');
          }
        } else {
          this.ctrl.notify(this.isEdit ? this.CONTACT_EDITED : this.CONTACT_ADDED);
      }
      } catch (e) {
        var msg = e.message || this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }
      this.isConnecting = false;
      return true;
    },
    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite(showToastMsg) {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id,
        inviteeId: this.data.id,
        businessName: this.data.organization,
        message: ''
      });
      try {
        await this.invitationDAO.put(invite);
        if ( showToastMsg ) {
          this.ctrl.notify(this.INVITE_SUCCESS);
        }
        // Force the view to update.
        this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
      } catch (e) {
        this.ctrl.notify(this.CONTACT_ADDED_INVITE_FAILURE, 'error');
        return false;
      }
      return true;
    },
    /** Add the bank account to the Contact. */
    async function addBankAccount() {
      this.isConnecting = true;
      var contact = this.contact;
      var bankAccount = this.data.createBankAccount;
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
        this.isConnecting = false;
        if ( this.isEdit && this.currentIndex === 0 ) {
          this.data.isEdit = false;
          X.closeDialog();
        }
        else if ( this.currentIndex > 0 ) {
          this.currentIndex = this.prevIndex;
        } else {
          X.pushMenu('sme.menu.toolbar');
        }
      }
    },
    {
      name: 'next',
      label: 'Next',
      isEnabled: function(data$errors_, data$createBankAccount$errors_, currentIndex) {
        if ( currentIndex === 1 ) return ! data$createBankAccount$errors_;
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
      name: 'option',
      label: 'Save without banking',
      isAvailable: function(currentIndex) {
        return currentIndex === 1;
      },
      code: async function(X) {
        if ( ! await this.addContact() ) return;
        X.closeDialog();
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
        if ( ! await this.addContact() ) return;
        if ( this.data.bankAccount === 0 && ! await this.addBankAccount() ) return;
        X.closeDialog();
      }
    }
  ]
});