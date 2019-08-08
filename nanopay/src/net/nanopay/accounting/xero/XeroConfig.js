foam.CLASS({
  package: 'net.nanopay.accounting.xero',
  name: 'XeroConfig',
  documentation: 'Abstract Model for Xero Config',
  javaImplements: [
    'com.xero.api.Config'
  ],
  ids: ['url'],

  tableColumns: [
    'url', 'appType', 'filesUrl'
   ],

  properties: [
    {
      class: 'String',
      name: 'url',
    },
    {
      class: 'String',
      name: 'appType',
      value: 'PUBLIC'
    },
    {
      class: 'String',
      name: 'privateKeyPassword'
    },
    {
      class: 'String',
      name: 'pathToPrivateKey'
    },
    {
      class: 'String',
      name: 'consumerKey',
    },
    {
      class: 'String',
      name: 'consumerSecret',
    },
    {
      class: 'String',
      name: 'apiUrl',
      value: 'https://api.xero.com/api.xro/2.0/'
    },
    {
      class: 'String',
      name: 'filesUrl'
    },
    {
      class: 'String',
      name: 'assetsUrl'
    },
    {
      class: 'String',
      name: 'bankFeedsUrl'
    },
    {
      class: 'String',
      name: 'requestTokenUrl',
      value: 'https://api.xero.com/oauth/RequestToken'
    },
    {
      class: 'String',
      name: 'authorizeUrl',
      value: 'https://api.xero.com/oauth/Authorize'
    },
    {
      class: 'String',
      name: 'accessTokenUrl',
      value: 'https://api.xero.com/oauth/AccessToken'
    },
    {
      class: 'String',
      name: 'userAgent',
    },
    {
      class: 'String',
      name: 'accept',
      value: 'XML'
    },
    {
      class: 'String',
      name: 'redirectUri',
    },
    {
      class: 'String',
      name: 'proxyHost'
    },
    {
      class: 'Long',
      name: 'proxyPort'
    },
    {
      class: 'Boolean',
      name: 'proxyHttpsEnabled'
    },
    {
      class: 'Int',
      name: 'connectTimeout'
    },
    {
      class: 'Int',
      name: 'readTimeout'
    },
    {
      class: 'String',
      name: 'decimalPlaces'
    },
    {
      class: 'String',
      name: 'appFirewallHostname'
    },
    {
      class: 'String',
      name: 'appFirewallUrlPrefix'
    },
    {
      class: 'String',
      name: 'keyStorePath'
    },
    {
      class: 'String',
      name: 'keyStorePassword'
    },
    {
      class: 'Boolean',
      name: 'usingAppFirewall'
    },
    {
      class: 'String',
      name: 'authCallBackUrl',
    }
  ],

  methods: [
    {
      name: 'isUsingAppFirewall',
      type: 'Boolean',
      type: 'Boolean',
      code: function () {
        return this.usingAppFirewall;
      },
      javaCode: `
        return this.getUsingAppFirewall();
      `
    }
  ]
});
