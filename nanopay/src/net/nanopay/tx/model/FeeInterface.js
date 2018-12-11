foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'FeeInterface',

  methods: [
    {
      name: 'getFee',
      returns: 'Long',
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
      returns: 'Long',
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
