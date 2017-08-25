foam.INTERFACE({
  package: 'net.nanopay.transactionservice',
  name: 'TransactionService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'transferValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'String'
        },
        {
          name: 'payeeId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'transferValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerEmail',
          javaType: 'String'
        },
        {
          name: 'payeeEmail',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'requestValueById',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerId',
          javaType: 'String'
        },
        {
          name: 'payeeId',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    },
    {
      name: 'requestValueByEmail',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'payerEmail',
          javaType: 'String'
        },
        {
          name: 'payeeEmail',
          javaType: 'String'
        },
        {
          name: 'amount',
          javaType: 'Integer'
        }
      ]
    }
  ]
});
