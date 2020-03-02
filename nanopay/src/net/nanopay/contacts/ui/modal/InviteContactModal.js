foam.CLASS({
  package: 'net.nanopay.contacts.ui.modal',
  name: 'InviteContactModal',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'A modal that lets a user invite a contact to the platform.',

  imports: [
    'ctrl',
    'invitationDAO',
    'notify',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Invitation'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 540px;
      max-height: 80vh;
      overflow-y: scroll;
    }
    ^ h2 {
      margin-top: 0;
    }
    ^main {
      padding: 24px 24px 32px;
    }
    ^invite-title {
      font-size: 24px !important;
      line-height: 1.5;
      font-weight: 900 !important;
      display: inline-block;
    }
    ^ textarea {
      height: auto !important;
    }
    ^ input:not([type="checkbox"]) {
      width: 100%;
    }
    ^ .property-message {
      width: 100%;
      border: solid 1px #8e9090;
    }
    ^button-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 84px;
      background-color: #fafafa;
      padding: 0 24px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-send {
      min-width: 104px;
      height: 36px;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back {
      color: #604aff;
      background-color: transparent;
      border: none;
      padding: 0;
      font-weight: normal;
      font-stretch: normal;
      font-style: normal;
      line-height: 1.43;
      margin: 32px 0;
    }
    ^ .net-nanopay-sme-ui-AbliiActionView-back:hover {
      background-color: transparent;
      color: #4d38e1;
      border: none;
    }
  `,

  messages: [
    {
      name: 'TITLE',
      message: 'Invite to Ablii'
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
      name: 'permission',
      label: `I have this contact's permission to invite them to Ablii`
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .addClass(this.myClass('main'))
          .start()
            .addClass('contact-title')
            .addClass(this.myClass('invite-title'))
            .add(this.TITLE)
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Business Name')
            .end()
            .startContext({ data: this.data })
              .tag(
                this.data.ORGANIZATION,
                { 
                  mode: this.data.organization ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW,
                  placeholder: 'ex. Vandelay Industries' 
                }
              )
            .endContext()
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Email')
            .end()
            .startContext({ data: this.data })
              .tag(
                this.data.EMAIL,
                {
                  mode: this.data.email ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW,
                  placeholder: 'ex. example@domain.com'
                }
              )
            .endContext()
          .end()
          .start()
            .addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .add('Message')
            .end()
            .tag(this.MESSAGE, { placeholder: 'Add a message to the invitation' })
          .end()
          .start()
            .addClass('input-wrapper')
            .tag(this.PERMISSION)
          .end()
        .end()
        .start().addClass(this.myClass('button-container'))
          .start(this.BACK).end()
          .start(this.SEND).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Go back',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'send',
      label: 'Send Invitation',
      isEnabled: function(permission) {
        return permission;
      },
      code: async function(X) {
        if ( this.data.errors_ ) {
          this.notify(this.data.errors_[0][1], 'error');
          return;
        }
        /** Send the invitation. */
        var invite = this.Invitation.create({
          email: this.data.email,
          businessName: this.data.organization,
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
