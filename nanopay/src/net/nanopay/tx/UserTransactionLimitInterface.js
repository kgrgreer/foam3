foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'UserTransactionLimitInterface',
  extends: 'foam.nanos.NanoService',

  methods: [
    {
      name: 'getLimit',
      javaReturns: 'net.nanopay.tx.model.TransactionLimit',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
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
