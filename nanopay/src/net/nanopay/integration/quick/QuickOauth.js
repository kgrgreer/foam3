foam.CLASS({
  package: 'net.nanopay.integration.quick',
  name: 'QuickOauth',
  documentation: 'Abstract Model for Xero Config',
  properties: [
    {
      class: 'Object',
      of: 'com.intuit.oauth2.client.OAuth2PlatformClient',
      name: 'oAuth',
    }
  ]
});
