foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'DeleteBankAccountModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'accountDAO',
    'closeDialog',
    'ctrl'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'account',
      documentation: 'The bank account to delete.'
    }
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ p {
      margin
    }
    ^inner-container {
      padding: 0 20px 20px 20px;
    }
    ^buttons {
      display: flex;
      justify-content: flex-end;
    }
    ^buttons > * {
      margin-left: 10px;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Delete bank account'
    },
    {
      name: 'BODY_COPY',
      message: 'Are you sure you want to delete this banking option? You ' +
        'will still be able to view payables and receivables related to this ' +
        'account.'
    },
    {
      name: 'DEFAULT_ERROR_MESSAGE',
      message: 'There was a problem deleting your account. Try again later.'
    },
    {
      name: 'SUCCESS_MESSAGE',
      message: 'Bank account deleted.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .tag(this.ModalHeader.create({ title: this.TITLE }))
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('inner-container'))
          .start('p').add(this.BODY_COPY).end()
          .start()
            .addClass(this.myClass('buttons'))
            .startContext({ data: this })
              .add(this.CANCEL)
              .add(this.DELETE)
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        this.closeDialog();
      }
    },
    {
      name: 'delete',
      code: function(X) {
        var self = this;
        X.accountDAO
          .remove(this.account)
          .then(() => {
            this.parentNode.parentNode.tag({
              class: 'foam.u2.dialog.NotificationMessage',
              message: this.SUCCESS_MESSAGE
            });
            self.closeDialog();
          })
          .catch((err) => {
            this.ctrl.tag({
              class: 'foam.u2.dialog.NotificationMessage',
              message: err.message || this.DEFAULT_ERROR_MESSAGE,
              type: 'error'
            });
          });
      }
    }
  ]
});
