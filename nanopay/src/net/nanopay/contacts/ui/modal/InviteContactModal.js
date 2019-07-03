foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'InviteContactModal',
  extends: 'foam.u2.Controller',

  documentation: 'A modal that lets a user invite a contact to the platform.',

  imports: [
    'ctrl',
    'invitationDAO',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation'
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
    ^ .foam-u2-ActionView-cancel {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^ .foam-u2-ActionView-cancel:hover {
      background: none;
      color: #525455;
      border: none;
      box-shadow: none;
    }
    ^ textarea {
      height: auto !important;
    }
    ^ input:not([type="checkbox"]) {
      width: 100%;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Invite to Ablii'
    },
    {
      name: 'CHECKBOX_LABEL',
      message: `I have this contact's permission to invite them to Ablii`
    },
    {
      name: 'INVITE_SUCCESS',
      message: 'Sent a request to connect.'
    },
    {
      name: 'INVITE_FAILURE',
      message: 'There was a problem sending the invitation.'
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
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 60 },
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
              .tag(this.data.EMAIL, { mode: foam.u2.DisplayMode.DISABLED })
            .endContext()
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Message')
            .end()
            .tag(this.MESSAGE)
          .end()
          .start()
            .addClass('input-wrapper')
            .tag(this.PERMISSION, { label: this.CHECKBOX_LABEL })
          .end()
        .end()
        .start()
          .addClass(this.myClass('buttons'))
          .tag(this.CANCEL, { buttonStyle: 'TERTIARY' })
          .add(this.SEND)
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
      name: 'send',
      isEnabled: function(permission) {
        return permission;
      },
      code: function(X) {
        /** Send the invitation. */
        var invite = this.Invitation.create({
          email: this.data.email,
          createdBy: this.user.id,
          message: this.message
        });
        this.invitationDAO
          .put(invite)
          .then(() => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_SUCCESS,
            }));
            // Force the view to update.
            this.user.contacts.cmd(foam.dao.AbstractDAO.RESET_CMD);
            X.closeDialog();
          })
          .catch(() => {
            this.ctrl.add(this.NotificationMessage.create({
              message: this.INVITE_FAILURE,
              type: 'error'
            }));
          });
      }
    }
  ]
});
