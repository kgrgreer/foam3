foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'BalanceServiceInterface',

  methods: [
    {
      name: 'findBalance',
      type: 'Long',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Long'
        }
      ]
    }
  ]
})
