foam.INTERFACE({
  package: 'net.nanopay.liquidity.tx',
  name: 'AccountHierarchy',
  methods: [
    {
      name: 'getChildAccounts',
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
    }
  ]
});
