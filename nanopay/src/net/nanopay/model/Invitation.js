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
  
  sections: [
    {
      name: 'inviteSection',
      title: 'Invite to Ablii'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50,
      hidden: true
    },
    {
      class: 'Long',
      name: 'inviteeId',
      hidden: true,
      documentation: 'Id of invitee if currently a user'
    },
    {
      class: 'String',
      name: 'businessName',
      section: 'inviteSection',
      documentation: `Hard set to business name when invitee is
      not a contact. Used to populate "name" email argument.`
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'invitee',
      hidden: true,
      storageTransient: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'inviter',
      hidden: true,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'message',
      section: 'inviteSection',
      documentation: 'Custom message for invitee'
    },
    {
      class: 'EMail',
      name: 'email',
      section: 'inviteSection',
      documentation: 'Email address of the invitee',
    },
    {
      class: 'Long',
      name: 'createdBy',
      hidden: true,
      documentation: 'Id of user sending the invite/request',
    },
    {
      class: 'DateTime',
      name: 'timestamp',
      label: 'Date',
      hidden: true,
      documentation: 'Timestamp of when invitation was sent',
    },
    {
      class: 'Boolean',
      name: 'internal',
      hidden: true,
      documentation: 'True if the invited user already existed, false ' +
          'otherwise',
    },
    {
      class: 'Boolean',
      name: 'isContact',
      hidden: true,
      documentation: `True if the invited user is a Contact.`
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.model.InvitationStatus',
      name: 'status',
      hidden: true
    },
    {
      class: 'String',
      name: 'group',
      hidden: true,
      documentation: `
        Used in Ablii when inviting someone who is not on the platform to join a
        Business.
      `
    },
    {
      class: 'String',
      name: 'firstName',
      documentation: 'Ablii signing officer\'s firstName'
    },
    {
      class: 'String',
      name: 'lastName',
      documentation: 'Ablii signing officer\'s lastName'
    },
    {
      class: 'String',
      name: 'jobTitle',
      hidden: true,
      documentation: 'Ablii signing officer\'s jobTitle'
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber',
      hidden: true,
      documentation: 'Ablii signing officer\'s phoneNumber'
    }
  ]
});
