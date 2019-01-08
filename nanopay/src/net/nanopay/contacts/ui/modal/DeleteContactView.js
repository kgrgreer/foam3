foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'DeleteContactView',
  extends: 'foam.u2.View',

  documentation: 'View for deleting a Contact',

  imports: [
    'notify',
    'user',
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ h2 {
      margin-top: 0;
    }
    ^ p {
      font-family: Lato;
      font-size: 14px;
    }
    ^main {
      padding: 24px;
    }
    ^ .buttons {
      background: #fafafa;
      height: 84px;
      padding: 24px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
    ^ .net-nanopay-ui-ActionView-delete,
    ^ .net-nanopay-ui-ActionView-delete:hover {
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background: #f91c1c;
      color: white;
      vertical-align: middle;
    }
    ^ .net-nanopay-ui-ActionView-delete:hover {
      opacity: 0.9;
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
    { name: 'TITLE', message: 'Delete contact?' },
    { name: 'CONFIRM_DELETE_1', message: 'Are you sure you want to delete ' },
    { name: 'CONFIRM_DELETE_2', message: ' from your contacts list?' },
    { name: 'SUCCESS_MSG', message: 'Contact deleted' },
    { name: 'FAIL_MSG', message: 'Failed to delete contact.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE)
          .end()
          .start('p')
            .add(`${this.CONFIRM_DELETE_1} '${this.data.organization}' ${this.CONFIRM_DELETE_2}`)
          .end()
        .end()
        .start()
          .addClass('buttons')
          .startContext({ data: this })
            .add(this.CANCEL)
            .add(this.DELETE)
          .endContext()
        .end();
    },

    async function deleteContact() {
      try {
        var result = await this.user.contacts.remove(this.data);
        if ( ! result ) throw new Error(this.FAIL_MSG);
        this.notify(this.SUCCESS_MSG);
      } catch (err) {
        var msg = err && err.message ? err.message : this.FAIL_MSG;
        this.notify(msg, 'error');
      };
    }
  ],

  actions: [
    {
      name: 'delete',
      label: 'Delete',
      code: function(X) {
        this.deleteContact();
        X.closeDialog();
      }
    },
    {
      name: 'cancel',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    }
  ]
});
