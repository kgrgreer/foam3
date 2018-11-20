foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  methods: [
    {
      name: 'exchangeForAccessToken',
      documentation: '',
      javaReturns: 'String',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          javaType: 'Long'
        },
        {
          name: 'publicToken',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'auth',
      documentation: '',
      javaReturns: 'String',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userId',
          javaType: 'Long'
        }
      ]
    },
  ]
});
