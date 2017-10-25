foam.CLASS({
  package: 'net.nanopay.auth.token',
  name: 'ClientTokenService',

  implements: [
    'net.nanopay.auth.token.TokenService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'net.nanopay.auth.token.TokenService',
      name: 'delegate'
    }
  ]
});
