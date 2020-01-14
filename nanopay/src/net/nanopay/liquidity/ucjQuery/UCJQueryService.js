foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'UCJQueryService',
  methods: [
    {
      name: 'getRoles',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'userId',
          type: 'Long'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'getUsers',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'roleId',
          type: 'String'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ]
    },
    {
      name: 'getApproversByLevel',
      type: 'List',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'modelToApprove',
          type: 'String'
        },
        {
          name: 'level',
          type: 'Integer'
        },
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
