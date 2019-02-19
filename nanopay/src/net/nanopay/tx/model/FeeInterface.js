foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'FeeInterface',

  methods: [
    {
      name: 'getFee',
      type: 'Long',
      async: true,
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ]
    },
    {
      name: 'getTotalAmount',
      type: 'Long',
      async: true,
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transactionAmount',
          type: 'Long',
        }
      ]
    }
  ]
});
