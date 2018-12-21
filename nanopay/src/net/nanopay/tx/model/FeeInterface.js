foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'FeeInterface',

  methods: [
    {
      name: 'getFee',
      javaReturns: 'long',
      swiftReturns: 'Int',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long',
          swiftType: 'Int'
        }
      ]
    },
    {
      name: 'getTotalAmount',
      javaReturns: 'long',
      swiftReturns: 'Int',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          javaType: 'long',
          swiftType: 'Int'
        }
      ]
    }
  ]
});
