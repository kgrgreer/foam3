foam.CLASS({
  package: "net.nanopay.fx.afex",
  name: "Token",
  properties: [
    {
      class: 'String',
      name: "access_token"
    },
    {
      class: 'String',
      name: "token_type"
    },
    {
      class: 'Int',
      name: "expires_in"
    }
  ]
});
