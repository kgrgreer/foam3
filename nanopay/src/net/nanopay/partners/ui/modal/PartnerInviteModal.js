/**
 * Modal to invite partners to the nanopay platform.
 */
foam.CLASS({
  package: 'net.nanopay.partners.ui.modal',
  name: 'PartnerInviteModal',
  extends: 'foam.u2.Controller',

  documentation: 'Modal to invite partners to the platform',

  imports: [
    'invitationDAO',
    'user',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.tag.TextArea',
    'net.nanopay.model.Invitation',
    'net.nanopay.ui.modal.ModalHeader',
  ],

  implements: [
    'net.nanopay.ui.modal.ModalStyling',
  ],

  properties: [
    'companyName',
    'contactName',
    'emailAddress',
    {
      name: 'message',
      view: 'foam.u2.tag.TextArea',
      value: '',
    },
  ],

  css: `
    ^ {
      border-radius: 2px;
      width: 448px;
      margin: auto;
      font-family: Roboto;
    }
    ^ .label {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
      margin-left: 0; /* Override */
    }
    ^ .one-col {
      margin: 20px;
    }
    ^ .two-col {
      display: flex;
      margin: 20px;
    }
    ^ .two-col > div {
      flex-grow: 1;
    }
    ^ .two-col > div:last-child {
      margin-left: 20px;
    }
    ^ input {
      width: 100%;
    }
    ^ .blue-button {
      margin: 20px 0; /* Override */
    }
    ^ textarea {
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 10px;
      font-family: Roboto;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2;
      text-align: left;
      color: #093649;
      width: 100%;
      white-space: normal !important; /* Override */
    }
  `,

  methods: [
    function initE() {
      this.message = this.user.firstName + ' from nanopay invites you to try ' +
          'out B2B payment platform. Instant transfers and secure ' +
          'transactions. Try it out now!';
      this.SUPER();
      this
        .tag(this.ModalHeader.create({ title: 'New Invite' }))
        .addClass(this.myClass())
          .start().addClass('two-col')
            .start()
              .start().add(this.COMPANY_NAME.label).addClass('label').end()
              .start(this.COMPANY_NAME).end()
            .end()
            .start()
              .start().add(this.CONTACT_NAME.label).addClass('label').end()
              .start(this.CONTACT_NAME).end()
            .end()
          .end()
          .start().addClass('one-col')
            .start().add(this.EMAIL_ADDRESS.label).addClass('label').end()
            .start(this.EMAIL_ADDRESS).end()
          .end()
          .start().addClass('one-col')
            .start().add(this.MESSAGE.label).addClass('label').end()
            .start(this.MESSAGE).attr('wrap', 'hard').end()
          .end()
          .start().addClass('one-col')
            .start(this.SEND_NEW_INVITE)
              .addClass('blue-button')
              .addClass('btn')
            .end()
          .end()
        .end();
    }
  ],

  messages: [
    {
      name: 'emailSent',
      message: 'Invite sent!'
    },
    {
      name: 'inviteSendError',
      message: 'There was a problem sending the invite email.'
    },
  ],

  actions: [
    {
      name: 'sendNewInvite',
      label: 'Send',
      help: 'Invite someone to the nanopay platform',
      code: async function(X) {
        var invite = this.Invitation.create();
        invite.email = this.emailAddress;
        invite.createdBy = this.user.id;
        invite.message = this.message;
        try {
          // See InvitationLogicDAO.java
          await this.invitationDAO.put(invite)
          this.add(this.NotificationMessage.create({
            message: this.emailSent,
          }));
        } catch (err) {
          console.error(err);
          this.add(this.NotificationMessage.create({
            message: this.inviteSendError,
            type: 'error',
          }));
        }
        X.closeDialog();
      }
    },
  ],
});
