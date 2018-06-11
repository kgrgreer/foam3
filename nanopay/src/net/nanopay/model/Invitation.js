foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Invitation',

  documentation: 'An invitation to join the B2B platform',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'Long',
      name: 'inviteeId',
      documentation: 'Id of invitee if currently a user',
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
      documentation: 'Timestamp of when invitation was sent',
    },
    {
      class: 'Boolean',
      name: 'internal',
      documentation: 'True if the invited user already existed, false ' +
          'otherwise',
    },
  ],
});
