foam.CLASS({
  package: 'net.nanopay.accounting.quickbooks',
  name: 'QuickbooksConfig',
  documentation: 'Abstract Model for Xero Config',
  ids: ['url'],

  tableColumns: [
    'url', 'clientId', 'appRedirect', 'intuitAccountingAPIHost'
  ],

  properties: [
    {
      class: 'String',
      name: 'url'
    },
    {
      class: 'String',
      name: 'clientId',
    },
    {
      class: 'String',
      name: 'clientSecret',
    },
    {
      class: 'String',
      name: 'appRedirect',
    },
    {
      class: 'String',
      name: 'intuitAccountingAPIHost',
      label: 'Intuit Accounting API Host'
    },
    {
      class: 'String',
      name: 'realm',
    },
    {
      class: 'Object',
      javaType: 'com.intuit.oauth2.client.OAuth2PlatformClient',
      name: 'oAuth',
    },
    {
      class: 'String',
      name: 'portal',
    },
  ]
});
