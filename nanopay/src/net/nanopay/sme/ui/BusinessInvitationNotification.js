foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInvitationNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Reference',
      name: 'businessId'
    }
  ]
});
