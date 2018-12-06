foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'ContactWizardModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Wizard Modal for Adding a Contact',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ {
      width: 510px;
      box-sizing: border-box;
    }
  `,

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      this.views = {
        'selectOption' : { view: { class: 'net.nanopay.contacts.ui.modal.SelectContactView' }, startPoint: true },
        'bankOption' : { view: { class: 'net.nanopay.contacts.ui.modal.ContactBankingOption' } },
        'information' : { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } }
      }
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
