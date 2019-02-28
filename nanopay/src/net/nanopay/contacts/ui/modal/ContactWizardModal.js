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
    ^ .foam-u2-tag-Input,
    ^ .foam-u2-TextField {
      width: 100%;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }
    ^ .contact-title {
      font-size: 24px;
      line-height: 1.5;
      font-weight: 900;
    }
    ^ .divider {
      background-color: #e2e2e3;
      height: 1px;
      margin: 24px 0;
      width: 100%;
    }
  `,

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
    }
  ],

  methods: [
    function init() {
      this.viewData.isBankingProvided = false;
      if ( this.data.id ) {
        if ( this.data.bankAccount ) {
          this.viewData.isBankingProvided = true;
          this.startAt = 'information';
        } else {
          this.startAt = 'editContact';
        }
      }
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
        'information': { view: { class: 'net.nanopay.contacts.ui.modal.ContactInformation' } },
        'AddContactStepOne': { view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepOne' } },
        'AddContactStepTwo': { view: { class: 'net.nanopay.contacts.ui.modal.AddContactStepTwo' } },
      };
    },

    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
    }
  ]
});
