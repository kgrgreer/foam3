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
          class: 'foam.core.Enum',
          of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          class: 'foam.core.Enum',
          of: 'net.nanopay.tx.model.TransactionLimitType',
          name: 'type'
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
          swiftType: 'Context'
        },
        {
          name: 'userId',
          javaType: 'long',
          swiftType: 'Int'
        },
        {
          class: 'foam.core.Enum',
          of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
          name: 'timeFrame'
        },
        {
          class: 'foam.core.Enum',
          name: 'type',
          of: 'net.nanopay.tx.model.TransactionLimitType'
        }
      ]
    }
  ]
});
