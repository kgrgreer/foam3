foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Identification',

  documentation: 'User identification method',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'identifier'
    },
    {
      class: 'Reference',
      name: 'owner',
      of: 'foam.nanos.auth.User'
    },
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'issuer'
    }
  ]
});