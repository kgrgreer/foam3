foam.INTERFACE({
  package: 'net.nanopay.fx',
  name: 'ExchangeRateServiceInterface',
  methods: [
    {
      name: 'exchange',
      type: 'Long',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'u1',
          type: 'String'
        },
        {
          name: 'u2',
          type: 'String'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ]
    },
    {
      name: 'getRate',
      type: 'Double',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'u1',
          type: 'String'
        },
        {
          name: 'u2',
          type: 'String'
        }
      ]
    }
  ]
})
