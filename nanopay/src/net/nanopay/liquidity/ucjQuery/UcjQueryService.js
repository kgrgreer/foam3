foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'UcjQueryService',
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
          name: 'level',
          type: 'Integer'
        }
      ]
    }
  ]
});
