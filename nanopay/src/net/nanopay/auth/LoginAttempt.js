foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'LoginAttempt',

  documentation: `Record of login attempt, including IP address`,

  implements: [
    'foam.nanos.auth.CreatedAware'
  ],

  imports: [
    'userDAO'
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
      label: 'User',
      documentation: 'User for whom login was attempted',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          this.add(user.email);
        }.bind(this));
      }
    },
    {
      name: 'loginSuccessful',
      class: 'Boolean',
      visibility: 'RO'
    }
  ]
});
