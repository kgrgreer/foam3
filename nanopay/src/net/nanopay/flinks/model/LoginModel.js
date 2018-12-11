//instance when Http status code is 200
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'LoginModel',

  documentation: 'model for Flinks Login',

  properties: [
    {
      class: 'String',
      name: 'Username',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'IsScheduledRefresh',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'LastRefresh',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'Id',
      visibility: 'RO'
    }
  ]
});
