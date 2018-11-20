foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'BusinessInvitationNotification',
  extends: 'foam.nanos.notification.Notification',

  properties: [
    {
      class: 'Long',
      name: 'createdBy'
    },
    {
      class: 'String',
      name: 'inviterName'
    },
    {
      class: 'Long',
      name: 'businessId'
    }
  ]
});
