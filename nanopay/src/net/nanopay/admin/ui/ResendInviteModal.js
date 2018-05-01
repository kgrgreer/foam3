foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'ResendInviteModal',
  extends: 'foam.u2.Controller',

  documentation: 'Resend invite modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'inviteToken',
    'closeDialog'
  ],

  css: `
    ^ {
      width: 448px;
      margin: auto;
    }
    ^ .content {
      padding: 20px;
      margin-top: -20px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 60px;
    }
    ^ .net-nanopay-ui-ActionView {
      width: 135px;
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }
    ^ .net-nanopay-ui-ActionView-resend {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .net-nanopay-ui-ActionView-resend:hover,
    ^ .net-nanopay-ui-ActionView-resend:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Resend Invite']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to resend this invitation?' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: this.title }))
        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.RESEND).end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function (X) {
        X.closeDialog();
      }
    },
    {
      name: 'resend',
      code: function (X) {
        var self = this;

        this.inviteToken.generateToken(null, this.data).then(function (result) {
          if ( ! result ) throw new Error('Unable to resend invitation.');
          X.closeDialog();
          self.add(self.NotificationMessage.create({ message: 'Invitation successfully resent.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to resend invitation.', type: 'error' }));
        });
      }
    }
  ]
});