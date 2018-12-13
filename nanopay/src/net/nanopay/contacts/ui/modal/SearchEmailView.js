foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'SearchEmailView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  implements: [
    'foam.mlang.Expressions'
  ],

  css: `
    ^ .title {
      margin: 0;
      padding: 24px;
      font-size: 24px;
      font-weight: 900;
    }
    ^ .field-label {
      font-size: 12px;
      font-weight: 600;
      margin-left: 25px;
      margin-bottom: -20px;
    }
    ^ .emailField {
      margin: 25px;
      width: 90%;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Add Contact' },
    { name: 'FIELD_EMAIL', message: 'Email' },
  ],

  properties: [
    {
      class: 'String',
      name: 'emailSearch',
      view: {
        class: 'foam.u2.tag.Input',
        placeholder: 'example@email.com',
        onKey: true
      },
      postSet: function(_, ne) {
        this.viewData.emailSet = ne;
      }
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .start('p')
            .addClass('title')
            .add(this.TITLE)
          .end()
          .start()
            .start('p')
              .addClass('field-label')
              .add(this.FIELD_EMAIL)
            .end()
            .start(this.EMAIL_SEARCH)
              .addClass('emailField')
            .end()
          .end()
        .end()
        .tag({
          class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar',
          back: this.BACK,
          next: this.NEXT
        });
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Close',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Start',
      code: async function(X) {
        if ( X.viewData.emailSet ) {
          try {
            var count = await X.userDAO
              .where(this.EQ(this.User.EMAIL, X.viewData.emailSet))
              .select(this.COUNT());
            if ( count && count.value != 0 ) {
              X.pushToId('selectOption');
            }
          } catch (error) {
            X.notify('error checking email', 'error');
          }
        }
        X.pushToId('bankOption');
      }
    },
  ]

});
