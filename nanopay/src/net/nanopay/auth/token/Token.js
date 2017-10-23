foam.CLASS({
  package: 'net.nanopay.auth.token',
  name: 'Token',

  documentation: 'Represents a token',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Reference',
      name: 'userId',
      of: 'foam.nanos.auth.User',
    },
    {
      class: 'String',
      name: 'data',
      documentation: 'The token data'
    },
    {
      class: 'Date',
      name: 'expiry',
      documentation: 'The token expiry date'
    }
  ]
});
