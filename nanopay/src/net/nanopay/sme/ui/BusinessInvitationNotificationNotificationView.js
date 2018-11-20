foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInvitationNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'user',
    'invitationDAO',
  ],

  exports: [
    'as data'
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div')
          .addClass('msg')
          .add(`${this.data.businessName} invited you to connect to their business.`)
        .end()
        .tag(this.CONNECT);
    }
  ],

  actions: [
    {
      name: 'connect',
      code: function() {
        // connect and add user to business.
      }
    }
  ]
});
