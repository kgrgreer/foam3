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
  package: 'net.nanopay.plaid',
  name: 'PlaidResultReport',

  tableColumns: ['nanopayUserId', 'accountHolderName', 'companyName', 'plaidId'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      hidden: true
    },
    {
      class: 'Long',
      name: 'nanopayUserId'
    },
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'String',
      name: 'accountHolderName'
    },
    {
      class: 'String',
      name: 'plaidId'
    },
    {
      class: 'String',
      name: 'nanopayAccountId',
      hidden: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'accountDetail',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'validationDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'ip'
    }
  ]
});
