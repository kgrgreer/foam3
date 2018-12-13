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
    'publicUserDAO',
    'validateEmail'
  ],

  css: `
    ^ .property-email {
      width: 100%;
    }
    ^container {
      margin: 24px;
    }
    ^buttons {
      background: #fafafa;
      height: 84px;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    ^ .net-nanopay-ui-ActionView-cancel {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^ .net-nanopay-ui-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Add Contact' },
    { name: 'PLACEHOLDER_EMAIL', message: 'example@email.com' },
    { name: 'GENERIC_LOOKUP_FAILED', message: `An unexpected problem occurred. Please try again later.` }
  ],

  properties: [
    {
      class: 'EMail',
      name: 'email',
      documentation: `
        The email address the user is trying to add a contact with.
      `,
      postSet: function(oldValue, newValue) {
        // Save this on the viewData object so we can access it again later in
        // another subview: ContactInformation.
        this.viewData.email = newValue;
      }
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
          .tag(this.EMAIL, {
            placeholder: this.PLACEHOLDER_EMAIL,
            onKey: true // So `isEnabled` on the 'next' action updates properly.
          })
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .add(this.CANCEL)
          .add(this.NEXT)
        .end();
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
        try {
          var count = await X.publicUserDAO
            .where(this.EQ(User.EMAIL, this.email))
            .select(this.COUNT());
          var nextView = count != null && count.value != 0
            ? 'selectOption'
            : 'bankOption';
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
