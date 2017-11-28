foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'UserTransactionLimit',

  methods: [
    {
      name: 'start',
      javaReturns: 'void'
    },
    {
      name: 'getLimit',
      javaReturns: 'long',
      swiftReturns: 'Int',
      returns: 'Promise',
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'timeFrame',
          javaType: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          swiftType: 'TransactionLimitTimeFrame'
        },
        {
          name: 'type',
          javaType: 'net.nanopay.tx.model.TransactionLimitType',
          swiftType: 'TransactionLimitType'
        }
      ]
    },
    {
      name: 'getRemainingLimit',
      javaReturns: 'long',
      swiftReturns: 'Int',
      returns: 'Promise',
      swiftThrows: true,
      args: [
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'timeFrame',
          javaType: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          swiftType: 'TransactionLimitTimeFrame'
        },
        {
          name: 'type',
          javaType: 'net.nanopay.tx.model.TransactionLimitType',
          swiftType: 'TransactionLimitType'
        }
      ]
    }
  ]
});
