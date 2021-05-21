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
  name: 'PlaidResponseItem',

  properties: [
    {
      class: 'Long',
      name: 'userId'
    },
    {
      class: 'String',
      name: 'InstitutionId'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidAccountDetail',
      name: 'accountDetail',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.USBankAccount',
      name: 'account',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidItem',
      name: 'plaidItem',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidError',
      name: 'plaidError',
    },
  ]
});
