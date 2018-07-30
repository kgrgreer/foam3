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
          of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
        },
        {
          name: 'type',
          javaType: 'net.nanopay.tx.model.TransactionLimitType',
          of: 'net.nanopay.tx.model.TransactionLimitType',
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
          name: 'x',
          javaType: 'foam.core.X',
          swiftType: 'foam.core.X'
        },
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          name: 'timeFrame',
          javaType: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
        },
        {
          name: 'type',
          javaType: 'net.nanopay.tx.model.TransactionLimitType',
          of: 'net.nanopay.tx.model.TransactionLimitType',
        }
      ]
    }
  ]
});
