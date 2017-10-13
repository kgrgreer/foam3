foam.INTERFACE({
  package: 'net.nanopay.cico.model',
  name: 'BaseServiceProvider',

  methods: [
    {
      name: 'getFee',
      javaReturns: 'long',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'providerId',
          javaType: 'long'
        },
        {
          name: 'amount',
          class: 'foam.core.Currency'
        }
      ]
    }
  ]
});
