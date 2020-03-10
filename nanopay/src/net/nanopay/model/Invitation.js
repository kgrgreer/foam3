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
      title: 'Invite a contact'
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
      name: 'businessName',
      section: 'inviteSection',
      documentation: `Hard set to business name when invitee is
      not a contact. Used to populate "name" email argument.`,
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. Vandelay Industries' },
      validateObj: function(businessName) {
        if (
          typeof businessName !== 'string' ||
          businessName.trim().length === 0
        ) {
          return 'Business name required';
        }
      },
    },
    {
      class: 'EMail',
      name: 'email',
      section: 'inviteSection',
      documentation: 'Email address of the invitee',
      view: { class: 'foam.u2.tag.Input', placeholder: 'ex. example@domain.com' },
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if ( ! emailRegex.test(email) ) {
          return 'Invalid email address.';
        }
      }
    },
    {
      class: 'String',
      name: 'message',
      section: 'inviteSection',
      documentation: 'Custom message for invitee',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 60, placeholder: 'Add a message to the invitation' },
    },
    {
      class: 'Boolean',
      name: 'invitePermission',
      section: 'inviteSection',
      label: `I have this contact's permission to invite them to Ablii`,
      documentation: 'True if user confirms invitation permission',
      view: { class: 'foam.u2.CheckBox' },
      validateObj: function(invitePermission) {
        if ( ! invitePermission ) {
          return 'Permission required.';
        }
      }
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
      hidden: true,
      documentation: 'Ablii signing officer\'s firstName'
    },
    {
      class: 'String',
      name: 'lastName',
      hidden: true,
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
