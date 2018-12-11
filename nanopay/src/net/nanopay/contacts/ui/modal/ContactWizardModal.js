foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard Modal for Adding a Contact',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  exports: [
    'addBusiness'
  ],

  imports: [
    'contactDAO',
    'ctrl',
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
        this.views = {
          'bankOption': { view: { class: 'net.nanopay.contacts.ui.modal.ContactBankingOption' }, startPoint: true },
          'information': { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } }
        };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    },

    async function addBusiness(newContact) {
      // Actual add contact
      try {
        var createdContact = await this.user.contacts.put(newContact);
          // potential failure check
          if ( ! createdContact ) {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.GENERIC_PUT_FAILED,
              type: 'error'
            }));
            return;
          }
          // Keep track through wizard of selected Contact
          this.viewData.selectedContact = createdContact;
          // Notify success
          this.ctrl.add(this.NotificationMessage.create({
            message: this.CONTACT_ADDED
          }));
      } catch (error) {
        this.ctrl.add(this.NotificationMessage.create({
          message: error.message || this.GENERIC_PUT_FAILED,
          type: 'error'
        }));
        return;
      }
    }
  ]
});
