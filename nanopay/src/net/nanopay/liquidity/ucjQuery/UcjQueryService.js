foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'UcjQueryService',
  methods: [
    {
      name: 'getRoles',
      type: 'foam.dao.DAO',
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
      type: 'foam.dao.DAO',
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
      type: 'foam.dao.DAO',
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
