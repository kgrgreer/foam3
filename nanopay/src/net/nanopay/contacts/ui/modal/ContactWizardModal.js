foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard for adding a Contact in Ablii',

  requires: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.model.Invitation'
  ],

  imports: [
    'ctrl',
    'invitationDAO',
    'user'
  ],

  exports: [
    'addContact',
    'caAccount',
    'isCABank',
    'isConnecting',
    'isEdit',
    'sendInvite',
    'usAccount'
  ],

  css: `
    ^ {
      width: 510px;
      box-sizing: border-box;
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

    /* Styles for contact sub wizard views */
    ^ .title-block {
      display: flex;
      justify-content: space-between;
    }
    ^ .contact-title {
      font-size: 24px !important;
      line-height: 1.5;
      font-weight: 900 !important;
      display: inline-block;
    }
    ^ .step-indicator {
      margin-top: 8px;
    }
    ^ .instruction {
      color: #8e9090;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
      margin-top: 8px;
    }
    ^ .divider {
      background-color: #e2e2e3;
      height: 1px;
      margin: 24px 0;
      width: 100%;
    }
    ^ .foam-u2-ActionView-back {
      color: /*%PRIMARY3%*/ #406dea !important;
      float: left;
    }
    ^ .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar-container {
      background-color: #ffffff;
      margin-top: 16px;
      padding: 0px !important;
    }
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      margin-top: 16px;
      margin-bottom: 8px;
    }
    ^ .two-column {
      display: grid;
      grid-gap: 16px;
      grid-template-columns: 1fr 1fr;
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
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      factory: function() {
        return net.nanopay.contacts.Contact.create({
          type: 'Contact',
          group: 'sme'
        });
      }
    },
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `
        The user is editing an existing contact, not creating a new one.
      `,
      factory: function() {
        return this.data.id;
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
      name: 'confirmRelationship',
      view: {
        class: 'foam.u2.CheckBox'
      }
    },
    {
      class: 'Boolean',
      name: 'shouldInvite',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      view: {
        class: 'foam.u2.CheckBox',
        label: 'Invite them to join Ablii'
      }
    },
    {
      class: 'FObjectProperty',
      name: 'caAccount',
      documentation: `The contact's bank account if they choose CA.`,
      factory: function() {
        var account = this.CABankAccount.create({
          denomination: 'CAD'
        });
        return account;
      }
    },
    {
      class: 'FObjectProperty',
      name: 'usAccount',
      documentation: `The contact's bank account if they choose US.`,
      factory: function() {
        var account =  this.USBankAccount.create({
          denomination: 'USD'
        });
        account.address.countryId = 'US';
        return account;
      }
    },
    {
      class: 'Boolean',
      name: 'isCABank',
      documentation: `True if working with a CA bank account, otherwise US.`,
      value: true
    }
  ],

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      if ( this.data.id ) {
        if ( this.data.bankAccount ) {
          this.viewData.isBankingProvided = true;
        }
        this.startAt = 'AddContactStepOne';
      }
      this.views = {
        'selectBusiness': {
          view: { class: 'net.nanopay.contacts.ui.modal.SearchBusinessView' },
          startPoint: true
        },
        'AddContactStepOne': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepOne' }
        },
        'AddContactStepTwo': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepTwo' }
        },
        'AddContactStepThree': {
          view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepThree' }
        },
      };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    /** Add the contact to the user's contacts. */
    async function addContact() {
      this.isConnecting = true;

      try {
        this.data = await this.user.contacts.put(this.data);
        if ( this.isEdit ) {
          this.ctrl.notify(this.CONTACT_UPDATED);
        } else {
          if ( this.shouldInvite ) {
            try {
              await this.sendInvite(false);
              this.ctrl.notify(this.CONTACT_ADDED_INVITE_SUCCESS);
            } catch (err) {
              var msg = err.message || this.GENERIC_PUT_FAILED;
              this.ctrl.notify(msg, 'error');
            }
          } else {
            this.ctrl.notify(this.CONTACT_ADDED);
          }
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
        createdBy: this.user.id
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
    }
  ]
});
