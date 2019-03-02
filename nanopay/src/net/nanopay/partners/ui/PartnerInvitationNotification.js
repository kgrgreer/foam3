foam.CLASS({
  package: 'net.nanopay.partners.ui',
  name: 'PartnerInvitationNotification',
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
      name: 'invitationId'
    }
  ]
});
