foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SearchEmailView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: `
    The first step in the ContactWizardModal. Let the user enter an email
    address. Use the email address to see if an existing user exists or not.
    The next step in the wizard depends on the result.
  `,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'ctrl',
    'publicUserDAO',
    'user',
    'validateEmail'
  ],

  css: `
    ^ .property-email {
      width: 100%;
    }
    ^container {
      margin: 24px;
    }
    ^ .net-nanopay-ui-ActionView-cancel,
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Add Contact' },
    { name: 'EMAIL_PLACEHOLDER', message: 'example@email.com' },
    { name: 'GENERIC_LOOKUP_FAILED', message: `An unexpected problem occurred. Please try again later.` },
    { name: 'EMAIL_ERR_MSG', message: 'Invalid email address.' },
    { name: 'ERROR_OWN_EMAIL', message: 'You cannot use your own email address.' }
  ],

  properties: [
    {
      class: 'EMail',
      name: 'email',
      documentation: `
        The email address the user is trying to add a contact with.
      `
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('container'))
          .start('h2')
            .add(this.TITLE)
          .end()
          .start()
            .addClass('input-label')
            .add(this.EMAIL.label)
          .end()
          .tag(this.EMAIL, {
            placeholder: this.EMAIL_PLACEHOLDER,
            onKey: true // So `isEnabled` on the 'next' action updates properly.
          })
        .end()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.CANCEL,
          next: this.NEXT
        });
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      isEnabled: function(email) {
        return this.validateEmail(email);
      },
      code: async function(X) {
        /**
         * Check if there's an existing User with the same email address. If so,
         * go to a view that lets the user pick from a list of existing
         * Businesses. Otherwise go to a screen that lets them choose to add a
         * Contact with or without bank account information.
         */
        const User = foam.nanos.auth.User;

        // Don't let people use their own email address.
        if ( this.email === this.user.email ) {
          this.ctrl.notify(this.ERROR_OWN_EMAIL, 'error');
          return;
        }

        try {
          var count = await X.publicUserDAO
            .where(this.EQ(User.EMAIL, this.email))
            .select(this.COUNT());
          var nextView = count != null && count.value != 0  ? 'selectOption' : 'editContact';
          // (this.wizard.viewData.isEdit) Used to toggle title in EditContactView,
          // which is called from here and on Edit from ContactController
          this.wizard.viewData.isEdit = false;
          X.pushToId(nextView);
        } catch (error) {
          var msg = error != null && typeof error.message === 'string'
            ? error.message
            : this.GENERIC_LOOKUP_FAILED;
          X.notify(msg, 'error');
        }
      }
    },
  ]

});
