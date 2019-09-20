foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'LoginAttempt',

  documentation: `Record of login attempt, including IP address`,

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  properties: [
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO'
    },
    {
      name: 'id',
      class: 'Long',
      hidden: true
    },
    {
      name: 'ipAddress',
      label: 'IP Address',
      class: 'String',
      visibility: 'RO'
    },
    {
      class: 'EMail',
      name: 'email',
      label: 'Email address',
      documentation: 'The email address that was used in the login attempt.',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'loginAttemptedFor',
      label: 'User ID',
      documentation: 'User for whom login was attempted',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'group',
      documentation: 'group for user whose login was attempted'
    },
    {
      name: 'loginSuccessful',
      class: 'Boolean',
      visibility: 'RO',
      tableCellFormatter: function(value) {
        this
          .start('span')
            .style({ color: value ? 'green' : 'red' })
            .add(value ? 'Yes' : 'No')
          .end();
      }
    }
  ]
});
