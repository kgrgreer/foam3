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
      required: true
    },
    {
      class: 'EMail',
      name: 'adminUserEmail',
      required: true
    },
    {
      class: 'Password',
      name: 'adminUserPassword',
      required: true
    },
    {
      class: 'String',
      name: 'adminUserFirstname',
      required: true
    },
    {
      class: 'String',
      name: 'adminUserLastname',
      required: true
    },
    {
      class: 'List',
      name: 'domain'
    },
    {
      class: 'String',
      name: 'appName',
      required: true
    },
    {
      class: 'String',
      name: 'description'
    }
  ]
});
