foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'LoginAttempt',

  documentation: `Modelled login attempt.
    Captures IP address of each attempt.`,

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],


  properties: [
    {
      class: 'DateTime',
      name: 'created',
    },
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'ipAddress',
      label: 'IP Address',
      class: 'String',
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'loginAttemptedFor',
      label: 'User Id',
      documentation: 'User for whom login was attempted'
    },
    {
      name: 'loginSuccessful',
      class: 'Boolean'
    }
  ]
});
