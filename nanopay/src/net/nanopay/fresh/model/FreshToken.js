foam.CLASS({
  package: 'net.nanopay.fresh.model',
  name: 'FreshToken',
  properties: [
    {
      class:'String',
      name: 'access_token'
    },
    {
      class:'String',
      name: 'token_type'
    },
    {
      class:'String',
      name: 'refresh_token'
    },
    {
      class:'Long',
      name: 'created_at'
    },
    {
      class:'Long',
      name: 'expires_in'
    }
  ]
})