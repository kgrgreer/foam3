foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Invitation',

  documentation: 'Objects will determine whether an invitation to the ' +
      'platform or a connection request will be sent',

  tableColumns: [
    'id',
    'invitee',
    'inviter',
    'timestamp',
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'Long',
      name: 'inviteeId',
      documentation: 'Id of invitee if currently a user',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'invitee',
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'inviter',
      storageTransient: true
    },
    {
      class: 'String',
      name: 'message',
      documentation: 'Custom message for invitee'
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'Email address of the invitee',
    },
    {
      class: 'Long',
      name: 'createdBy',
      documentation: 'Id of user sending the invite/request',
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      label: 'Date',
      documentation: 'Timestamp of when invitation was sent',
    },
    {
      class: 'Boolean',
      name: 'internal',
      documentation: 'True if the invited user already existed, false ' +
          'otherwise',
    },
    {
      class: 'Boolean',
      name: 'isContact',
      documentation: `True if the invited user is a Contact.`
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.model.InvitationStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'group',
      documentation: `
        Used in Ablii when inviting someone who is not on the platform to join a
        Business.
      `
    }
  ]
});
