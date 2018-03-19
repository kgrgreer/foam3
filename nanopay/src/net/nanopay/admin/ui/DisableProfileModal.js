foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'DisableProfileModal',
  extends: 'foam.u2.Controller',

  documentation: 'Disable profile modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.ui.modal.ModalHeader',
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'userDAO',
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
    ^ .net-nanopay-ui-ActionView-cancel {
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
    }
    ^ .net-nanopay-ui-ActionView-cancel:hover,
    ^ .net-nanopay-ui-ActionView-cancel:focus {
      background-color: rgba(164, 179, 184, 0.3);
    }
    ^ .rightContainer {
      display: inline-block;
      float:right;
    }
    ^ .net-nanopay-ui-ActionView-disable {
      background-color: #59a5d5;
      color: white;
    }
    ^ .net-nanopay-ui-ActionView-disable:hover,
    ^ .net-nanopay-ui-ActionView-disable:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Disable Profile']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to disable this profile?' }
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
            .start('div').addClass('rightContainer')
              .start(this.DISABLE).end(0)
            .end()
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
      name: 'disable',
      code: function (X) {
        var self = this;
        var toDisable = this.data.clone();
        toDisable.status = this.AccountStatus.DISABLED;

        this.userDAO.put(toDisable)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to disable profile');
          X.closeDialog();
          self.data.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: 'Profile successfully disabled.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to disable profile.', type: 'error' }));
        });
      }
    }
  ]
});