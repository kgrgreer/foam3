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

  // TODO: This shouldn't be needed.
  exports: [
    'data'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      factory: function() {
        return net.nanopay.contacts.Contact.create({
          emailVerified: true, // FIXME
          type: 'Contact',
          group: 'sme',
          enabled: true // for correct deletion checks
        });
      }
    }
  ],

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      if ( this.data.id ) this.startAt = 'editContact';
      this.views = {
        'editContact': { view: { class: 'net.nanopay.contacts.ui.modal.EditContactView' } },
        'emailOption': {
          view: {
            class: 'net.nanopay.contacts.ui.modal.SearchEmailView',
            email$: this.data.email$
          },
          startPoint: true
        },
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
