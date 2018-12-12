foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard modal for adding a Contact',

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
      if ( this.data ) this.startAt = 'editContact';
      this.views = {
        'editContact': { view: { class: 'net.nanopay.contacts.ui.modal.EditContactView' } },
        'emailOption': { view: { class: 'net.nanopay.contacts.ui.modal.SearchEmailView' }, startPoint: true },
        'selectOption': { view: { class: 'net.nanopay.contacts.ui.modal.SelectContactView' } },
        'bankOption': { view: { class: 'net.nanopay.contacts.ui.modal.ContactBankingOption' } },
        'information': { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } }
      };
      
      // TODO: ask kenny how to do views.push - to clean our repetive
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
