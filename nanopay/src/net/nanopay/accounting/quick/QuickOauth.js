foam.CLASS({
  package: 'net.nanopay.accounting.quick',
  name: 'QuickOauth',
  documentation: 'Abstract Model for Xero Config',
  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Object',
      javaType: 'com.intuit.oauth2.client.OAuth2PlatformClient',
      name: 'oAuth',
    }
  ]
});
