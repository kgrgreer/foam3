foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'AccountUcjQueryService',
  methods: [
    {
      name: 'getRoles',
      type: 'FObjectArray',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getUsers',
      type: 'FObjectArray',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getAccounts',
      type: 'FObjectArray',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'roleId',
          type: 'String'
        }
      ]
    },
    {
      name: 'getApproversByLevel',
      type: 'FObjectArray',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'accountId',
          type: 'String'
        },
        {
          name: 'level',
          type: 'Integer'
        }
      ]
    }
  ]
});
