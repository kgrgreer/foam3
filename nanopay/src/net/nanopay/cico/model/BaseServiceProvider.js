foam.INTERFACE({
  package: 'net.nanopay.cico.model',
  name: 'BaseServiceProvider',

  methods: [
    {
      name: 'getFee',
      javaReturns: 'net.nanopay.tx.model.Fee',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'providerId',
          javaType: 'Long'
        },
        {
          name: 'amount',
          javaType: 'foam.core.Currency'
        }
      ]
    }
  ]
});
