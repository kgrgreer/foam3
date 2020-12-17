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

foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  javaImports: [
    'net.nanopay.plaid.model.PlaidPublicToken'
  ],

  methods: [
    {
      name: 'startIntegration',
      type: 'net.nanopay.plaid.PlaidResponseItem',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'publicToken',
          type: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'exchangeForAccessToken',
      type: 'String',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'publicToken',
          type: 'net.nanopay.plaid.model.PlaidPublicToken'
        }
      ]
    },
    {
      name: 'fetchAccountsDetail',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          type: 'String'
        }
      ]
    },
    {
      name: 'importSelectedAccountToSystem',
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'plaidInstitutionId',
          type: 'String'
        },
        {
          name: 'selectedAccount',
          type: 'Map'
        },
        {
          name: 'responseItem',
          type: 'net.nanopay.plaid.PlaidResponseItem'
        }
      ]
    },
    {
      name: "getCredentialForClient",
      type: "net.nanopay.plaid.config.PlaidCredential",
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        },
      ]
    },
    {
      name: 'saveAccount',
      type: 'net.nanopay.plaid.PlaidResponseItem',
      async: true,
      javaThrows: ['java.io.IOException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'plaidResponseItem',
          type: 'net.nanopay.plaid.PlaidResponseItem'
        }
      ]
    },
  ]
});
