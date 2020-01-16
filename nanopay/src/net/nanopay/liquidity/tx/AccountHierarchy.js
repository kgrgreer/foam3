foam.INTERFACE({
  package: 'net.nanopay.liquidity.tx',
  name: 'AccountHierarchy',
  methods: [
    {
      name: 'getChildAccountIds',
      type: 'java.util.HashSet',
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
          name: 'template',
          type: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate'
        }
      ]
    },
    {
      name: 'getRevokedAccountsMap',
      type: 'net.nanopay.liquidity.crunch.AccountApproverMap',
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
          name: 'template',
          type: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplate'
        }
      ]
    }
  ]
});
