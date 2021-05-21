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
  package: 'net.nanopay.plaid.model',
  name: 'PlaidItem',

  documentation: `
    Plaid access token and item id.
    Please see: https://plaid.com/docs/#exchange-token-flow
                https://plaid.com/docs/quickstart/#item-creation-flow`,

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'accessToken'
    },
    {
      class: 'String',
      name: 'itemId'
    },
    {
      class: 'String',
      name: 'institutionName'
    },
    {
      class: 'String',
      name: 'institutionId'
    },
    {
      class: 'Boolean',
      name: 'loginRequired'
    }
  ]
});
