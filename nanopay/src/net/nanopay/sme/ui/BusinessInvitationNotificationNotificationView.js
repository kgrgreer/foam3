foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInvitationNotificationNotificationView',
  extends: 'foam.nanos.notification.NotificationView',

  documentation: 'Notification view when users are added to a business.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessDAO'
  ],

  exports: [
    'as data'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'business'
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.businessDAO.find(this.data.businessId).then(function(business) {
        self.business = business;
      });
    },
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .addClass('msg')
          .add(this.business$.dot('businessName'), ' added you to their business.')
        .end();
    }
  ]
});
