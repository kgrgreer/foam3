//instance when Http status code is 200
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'LoginModel',

  documentation: 'model for Flinks Login',

  properties: [
    {
      class: 'String',
      name: 'Username'
    },
    {
      class: 'Boolean',
      name: 'IsScheduledRefresh'
    },
    {
      class: 'String',
      name: 'LastRefresh'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});