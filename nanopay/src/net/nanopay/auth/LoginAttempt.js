foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'LoginAttempt',

  documentation: `Modelled login attempt.
    Captures IP address of each attempt.`,

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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'loginAttemptedFor',
      label: 'User',
      documentation: 'User for whom login was attempted',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          let displayName = user.legalName;
          if (displayName.trim() === '') {
            displayName = user.email;
          }

          this.add(displayName);;
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
