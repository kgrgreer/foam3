/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
      code: function () {
        return this.usingAppFirewall;
      },
      javaCode: `
        return this.getUsingAppFirewall();
      `
    }
  ]
});
