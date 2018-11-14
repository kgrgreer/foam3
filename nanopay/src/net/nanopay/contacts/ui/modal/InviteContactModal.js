foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'InviteContactModal',
  extends: 'foam.u2.Controller',

  documentation: 'A modal that lets a user invite a contact to the platform.',

  requires: [
    'net.nanopay.contacts.Contact'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ h2 {
      margin-top: 0;
    }
    ^main {
      padding: 24px;
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
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Invite to Ablii'
    },
    {
      name: 'CHECKBOX_LABEL',
      message: 'I have this contacts permission to invite them to Ablii'
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'data',
      factory: function() {
        return this.Contact.create();
      }
    },
    {
      class: 'String',
      name: 'message',
      documentation: `A message a user can include in the invitation email.`,
      view: { class: 'foam.u2.tag.TextArea', rows: 16, cols: 60 },
    },
    {
      class: 'Boolean',
      name: 'permission'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start('h2')
            .add(this.TITLE)
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Email')
            .end()
            .startContext({ data: this.data })
              .start(this.data.EMAIL)
                .addClass('input-field')
              .end()
            .endContext()
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Message')
            .end()
            .start(this.MESSAGE)
              .addClass('input-field')
            .end()
          .end()
          .start()
            .addClass('input-wrapper')
            .tag({
              class: 'foam.u2.CheckBox',
              data: this.permission,
              label: this.CHECKBOX_LABEL
            })
          .end()
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .add(this.CANCEL)
          .add(this.SAVE)
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function() {
        // TODO
      }
    },
    {
      name: 'save',
      code: function() {
        // TODO
      }
    }
  ]
});
