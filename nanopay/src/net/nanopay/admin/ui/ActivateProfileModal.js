foam.CLASS({
  package: 'net.nanopay.admin.ui',
  name: 'ActivateProfileModal',
  extends: 'foam.u2.Controller',

  documentation: 'Activate profile modal',

  implements: [
    'net.nanopay.ui.modal.ModalStyling'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.ui.modal.ModalHeader',
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
      height: 40px;
      border-radius: 2px;
      overflow: hidden;
      zoom: 1;
    }
    ^ .net-nanopay-ui-ActionView-activate {
      background-color: #59a5d5;
      color: white;
      display: inline-block;
      float:right;
    }
    ^ .net-nanopay-ui-ActionView-activate:hover,
    ^ .net-nanopay-ui-ActionView-activate:focus {
      background-color: #357eac;
    }
  `,

  properties: [
    'data',
    ['title', 'Activate Profile']
  ],

  messages: [
    { name: 'Description', message: 'Are you sure you want to activate this profile?' }
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
            .start(this.ACTIVATE).end()
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
      name: 'activate',
      code: function (X) {
        var self = this;
        var toActivate = this.data;
        toActivate.status = this.AccountStatus.ACTIVE;
        
        this.userDAO.put(toActivate)
        .then(function (result) {
          if ( ! result ) throw new Error('Unable to activate profile.');
          X.closeDialog();
          self.data.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: 'Profile successfully activated.' }));
        })
        .catch(function (err) {
          self.add(self.NotificationMessage.create({ message: 'Unable to activate profile.', type: 'error' }));
        });
      }
    }
  ]
});