foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'EditContactView',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.ui.LoadingSpinner',
  ],

  imports: [
    'accountDAO',
    'ctrl',
    'invoiceDAO',
    'loadingSpin',
    'notify',
  ],

  css: `
    ^ .content {
      padding: 24px;
    }
    ^ .option-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding: 24px;
      box-sizing: border-box;
      background-color: #fafafa;
    }
    ^ .option-container button + button {
      margin-left: 8px;
    }
  `,

  messages: [
    { name: 'TITLE', message: 'Edit Contact' },
    { name: 'QUESTION', message: 'Would you like to add a bank account to this contact?' }
  ],

  methods: [
    function init() {
      this.SUPER();
      if ( this.wizard.data.bankAccount ) {
        // Contact has a bank account.
        this.viewData.isBankingProvided = true;
        // this.closeDialog(); // Why is this needed?
        this.pushToId('information');
      }
    },

    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass('content')
          .start('h2')
            .addClass('popUpTitle')
            .add(this.TITLE)
          .end()
          .start('p')
            .add(this.QUESTION)
          .end()
        .end()
        .start()
          .addClass('option-container')
          .tag(this.NO)
          .tag(this.YES)
        .end();
    }
  ],

  actions: [
    {
      name: 'no',
      code: function(X) {
        X.viewData.isBankingProvided = false;
        X.pushToId('information');
      }
    },
    {
      name: 'yes',
      code: function(X) {
        X.viewData.isBankingProvided = true;
        X.pushToId('information');
      }
    }
  ]

});
