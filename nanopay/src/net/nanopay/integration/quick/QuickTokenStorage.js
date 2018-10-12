foam.CLASS({
  package: 'net.nanopay.integration.quick',
  name: 'QuickTokenStorage',
  documentation: 'Model to hold the token data for the Xero user',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'csrf'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'String',
      name: 'authCode'
    },
    {
      class: 'String',
      name: 'accessToken'
    },
    {
      class: 'String',
      name: 'refreshToken'
    },
    {
      class: 'String',
      name: 'portalRedirect'
    }
  ]
});
