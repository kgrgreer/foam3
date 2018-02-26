foam.CLASS({package: 'com.xero.api', name: 'Config'});

foam.CLASS({
  package: 'net.nanopay.invoice.xero',
  name: 'AbstractXeroService',
  implements: [ 'com.xero.api.Config' ],
  properties: [
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
      value: '4NFGP8ALQTGYKUL3BWD3EUMSOFQXIL'
    },
    {
      class: 'String',
      name: 'consumerSecret',
      value: 'WPTSKCUDASSYFZQI7KVKMSEMBVXS1T'
    },
    {
      class: 'String',
      name: 'apiUrl',
      value: 'https://api.xero.com/api.xro/2.0/'
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
      value: 'NANOPAY-B2B'
    },
    {
      class: 'String',
      name: 'accept',
      value: 'XML'
    },
    {
      class: 'String',
      name: 'redirectUri',
      value: 'http://127.0.0.1:8080/xeroCallback'
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
      class: 'String',
      name: 'authCallBackUrl',
      value: 'http://127.0.0.1:8080/xeroCallback'
    }
  ]
});
