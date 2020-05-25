foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspInfo',
  ids: ['spid'],

  documentation: 'The base model for the Multi Service Provider Setup.',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      validationPredicates: [
        {
          args: ['spid'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.msp.MspInfo.SPID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in spid.'
        }
      ]
    },
    {
      class: 'String',
      name: 'adminUserEmail',
      validationPredicates: [
        {
          args: ['spid'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.msp.MspInfo.ADMIN_USER_EMAIL, /^[A-Za-z0-9._%+-]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,6}$/);
          },
          errorString: 'Invalid email address.'
        }
      ]
    },
    {
      class: 'Password',
      name: 'adminUserPassword'
    },
    {
      class: 'String',
      name: 'adminUserFirstname',
      validationPredicates: [
        {
          args: ['adminUserFirstname'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.msp.MspInfo.ADMIN_USER_FIRSTNAME, '');
          },
          errorString: 'First name required.'
        }
      ]
    },
    {
      class: 'String',
      name: 'adminUserLastname',
      validationPredicates: [
        {
          args: ['adminUserLastname'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.msp.MspInfo.ADMIN_USER_LASTNAME, '');
          },
          errorString: 'Last name required.'
        }
      ]
    },
    {
      class: 'List',
      name: 'domain'
    },
    {
      class: 'String',
      name: 'appName'
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
