foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'RevokeInviteModal',
  extends: 'foam.u2.Controller',

  documentation: 'Revoke invite modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'closeDialog',
    'editProfilePopUp',
    'userDAO'
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
    ^ .net-nanopay-ui-ActionView-revoke {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .net-nanopay-ui-ActionView-revoke:hover,
    ^ .net-nanopay-ui-ActionView-revoke:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Revoke Invite']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to revoke this invitation?' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      if (this.editProfilePopUp) this.editProfilePopUp.remove();
      
      this
        .addClass(this.myClass())
        .tag(this.ModalHeader.create({ title: this.title }))
        .start('div').addClass('content')
          .start('p').addClass('description').add(this.Description).end()
          .start()
            .start(this.CANCEL).end()
            .start(this.REVOKE).end()
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
      name: 'revoke',
      code: function (X) {
        var self = this;
        var toRevoke = this.data;
        toRevoke.status = this.AccountStatus.REVOKED;

        this.userDAO.put(toRevoke)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to revoke profile.');
          X.closeDialog();
          self.data.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: 'Profile successfully revoked.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to revoke profile.', type: 'error' }));
        });
      }
    }
  ]
});