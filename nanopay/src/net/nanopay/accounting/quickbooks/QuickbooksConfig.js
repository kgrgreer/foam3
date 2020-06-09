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
