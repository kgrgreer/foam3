foam.INTERFACE({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'AccountUcjQueryService',
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
        {
          name: 'accountId',
          type: 'Long'
        }
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
        },
        {
          name: 'accountId',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getAccounts',
      type: 'foam.dao.DAO',
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
      type: 'foam.dao.DAO',
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
