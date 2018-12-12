foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard modal for adding a Contact',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  exports: [
    'addBusiness'
  ],

  imports: [
    'notify',
    'user'
  ],

  css: `
    ^ {
      width: 510px;
      box-sizing: border-box;
    }
  `,

  messages: [
    { name: 'GENERIC_PUT_FAILED', message: 'Adding/updating the contact failed.' },
    { name: 'CONTACT_ADDED', message: 'Contact added successfully' },
  ],

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      if ( this.data ) {
        // On edit Contact
        this.views = {
          'editContact': { view: { class: 'net.nanopay.contacts.ui.modal.EditContactView' }, startPoint: true },
          'bankOption': { view: { class: 'net.nanopay.contacts.ui.modal.ContactBankingOption' } },
          'information': { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } }
        };
      } else {
        // on add Contact
        this.views = {
          'selectOption': { view: { class: 'net.nanopay.contacts.ui.modal.SelectContactView' }, startPoint: true },
          'bankOption': { view: { class: 'net.nanopay.contacts.ui.modal.ContactBankingOption' } },
          'information': { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } }
        };
      }
      // TODO: ask kenny how to do views.push - to clean our repetive
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    async function addBusiness(newContact) {
      try {
        var createdContact = await this.user.contacts.put(newContact);

        if ( createdContact == null ) {
          this.notify(this.GENERIC_PUT_FAILED, 'error');
          return;
        }

        // Keep track through wizard of selected Contact
        this.viewData.selectedContact = createdContact;

        // Notify success
        this.notify(this.CONTACT_ADDED);
      } catch (error) {
        this.notify(error ? error.message : this.GENERIC_PUT_FAILED, 'error');
      }
    }
  ]
});
