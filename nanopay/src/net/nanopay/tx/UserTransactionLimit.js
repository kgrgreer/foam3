foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'UserTransactionLimit',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'getLimit',
      javaReturns: 'net.nanopay.tx.model.TransactionLimit',
      returns: 'Promise',
      args: [
        {
          name: 'userId',
          javaType: 'long'
        },
        {
          name: 'timeFrame',
          javaType: 'net.nanopay.tx.model.TransactionLimitTimeFrame'
        },
        {
          name: 'type',
          javaType: 'net.nanopay.tx.model.TransactionLimitType'
        }
      ]
    }
  ]
});
