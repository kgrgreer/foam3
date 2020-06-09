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
  package: 'net.nanopay.liquidity.tx',
  name: 'AccountHierarchy',
  methods: [
    {
      name: 'getChildAccountIds',
      type: 'java.util.HashSet',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'parentId',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getViewableRootAccounts',
      type: 'java.util.List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'userId',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getChildAccounts',
      type: 'java.util.List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.Account'
        }
      ]
    },
    {
      name: 'getAccountsFromAccountTemplate',
      type: 'net.nanopay.liquidity.crunch.AccountMap',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'template',
          type: 'net.nanopay.liquidity.crunch.AccountTemplate'
        }
      ]
    },
    {
      name: 'getAssignedAccountMap',
      type: 'net.nanopay.liquidity.crunch.AccountApproverMap',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'trackRootAccounts',
          type: 'Boolean'
        },
        {
          name: 'user',
          type: 'Long'
        },
        {
          name: 'oldTemplate',
          type: 'net.nanopay.liquidity.crunch.AccountApproverMap'
        },
        {
          name: 'newMap',
          javaType: 'java.util.Map<String, net.nanopay.liquidity.crunch.CapabilityAccountData>'
        }
      ]
    },
    {
      name: 'getRevokedAccountsMap',
      type: 'net.nanopay.liquidity.crunch.AccountApproverMap',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'trackRootAccounts',
          type: 'Boolean'
        },
        {
          name: 'user',
          type: 'Long'
        },
        {
          name: 'oldTemplate',
          type: 'net.nanopay.liquidity.crunch.AccountApproverMap'
        },
        {
          name: 'newMap',
          javaType: 'java.util.Map<String, net.nanopay.liquidity.crunch.CapabilityAccountData>'
        }
      ]
    },
    {
      name: 'removeRootFromUser',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'Long'
        },
        {
          name: 'account',
          type: 'Long'
        }
      ]
    }
  ]
});
