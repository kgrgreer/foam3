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
  name: 'QuickbooksToken',

  documentation: 'Model to hold the token data for QuickBooks users.',

  tableColumns: [
    'id', 'businessName', 'appRedirect', 'portalRedirect', 'quickBank'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      tableWidth: 50
    },
    {
      class: 'String',
      name: 'csrf',
      documentation: 'Cross-site request forgery token.'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'String',
      name: 'businessName'
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
      name: 'appRedirect'
    },
    {
      class: 'String',
      name: 'portalRedirect'
    },
    {
      class: 'String',
      name: 'quickBank',
    }
  ]
});
