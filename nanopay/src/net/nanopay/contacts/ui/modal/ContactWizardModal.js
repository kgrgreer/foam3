foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard for adding a Contact',

  css: `
    ^ {
      width: 510px;
      box-sizing: border-box;
    }
  `,

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
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
