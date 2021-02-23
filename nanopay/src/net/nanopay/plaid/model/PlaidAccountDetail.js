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
  name: 'PlaidAccountDetail',

  ids: ['userId', 'institutionId', 'name', 'mask'],

  properties: [
    {
      class: 'Long',
      name: 'userId',
      hidden: true
    },
    {
      class: 'String',
      name: 'itemId',
      hidden: true
    },
    {
      class: 'String',
      name: 'institutionName',
    },
    {
      class: 'String',
      name: 'institutionId',
      hidden: true
    },
    {
      class: 'String',
      name: 'accountId'
    },
    {
      class: 'String',
      name: 'mask',
      hidden: true
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'officialName'
    },
    {
      class: 'String',
      name: 'subtype',
      hidden: true
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidBalances',
      name: 'balance'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.ACH',
      name: 'ACH'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.EFT',
      name: 'EFT',
      hidden: true
    }
  ]
});
