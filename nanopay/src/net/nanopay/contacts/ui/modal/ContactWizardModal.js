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
    'isConnecting',
    'isEdit',
    'sendInvite',
    'caAccount',
    'usAccount',
    'isCABank'
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
  ^ .net-nanopay-ui-ActionView-back {
    color: %SECONDARYCOLOR% !important;
    float: left;
  }
  ^ .net-nanopay-sme-ui-wizardModal-WizardModalNavigationBar-container {
    background-color: #ffffff;
    margin-top: 16px;
    padding: 0px !important;
  }
`,

  messages: [
    { name: 'CONTACT_ADDED', message: 'Contact added' },
    { name: 'CONTACT_UPDATED', message: 'Contact updated' },
    { name: 'INVITE_SUCCESS', message: 'Invitation sent!' },
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
      name: 'shouldInvite',
      documentation: `
        True if the user wants to invite the contact to join Ablii.
      `,
      value: false,
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
          view: {
            class: 'net.nanopay.contacts.ui.modal.SearchBusinessView',
            email$: this.data.email$
          },
          startPoint: true
        },
        'AddContactStepOne': { view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepOne' } },
        'AddContactStepTwo': { view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepTwo' } },
        'AddContactStepThree': { view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepThree' } },
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
          this.ctrl.notify(this.CONTACT_ADDED);
        }
      } catch (e) {
        var msg = e != null && e.message ? e.message : this.GENERIC_PUT_FAILED;
        this.ctrl.notify(msg, 'error');
        this.isConnecting = false;
        return false;
      }

      this.isConnecting = false;
      return true;
    },

    /** Send the Contact an email inviting them to join Ablii. */
    async function sendInvite() {
      var invite = this.Invitation.create({
        email: this.data.email,
        createdBy: this.user.id
      });

      try {
        this.invitationDAO.put(invite);
        this.ctrl.notify(this.INVITE_SUCCESS);
        this.user.contacts.on.reset.pub(); // Force the view to update.
      } catch (e) {
        var msg = e != null && e.message ? e.message : this.INVITE_FAILURE;
        this.ctrl.notify(msg, 'error');
        return false;
      }

      return true;
    }
  ]
});
