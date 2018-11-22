foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInvitationNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId'
    }
  ]
});
