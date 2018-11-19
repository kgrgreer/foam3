foam.INTERFACE({
  package: 'net.nanopay.plaid',
  name: 'PlaidService',

  methods: [
    {
      name: 'exchangeForAccessToken',
      javaReturns: 'String',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'publicToken',
          javaType: 'String'
        }
      ]
    }
  ]
});
