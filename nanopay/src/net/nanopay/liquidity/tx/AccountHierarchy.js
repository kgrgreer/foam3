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
    }
  ]
});
