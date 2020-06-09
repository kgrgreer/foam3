foam.CLASS({
  package: 'net.nanopay.msp',
  name: 'MspInfo',
  ids: ['spid'],

  documentation: 'The base model for the Multi Service Provider Setup.',

  tableColumns: [
    'spid',
    'adminUserPassword',
    'adminUserFirstname',
    'adminUserLastname',
    'appName',
    'description'
  ],

  searchColumns: [
    'spid',
    'adminUserFirstname',
    'adminUserLastname',
    'appName'
  ],

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
      class: 'StringArray',
      name: 'domain',
      factory: function() {
        return [];
      },
      javaFactory: 'return new String[0];',
      required: true
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
