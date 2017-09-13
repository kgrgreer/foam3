foam.INTERFACE({
  package: 'net.nanopay.interac.service',
  name: 'InteracService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'transferValue',
      javaReturns: 'net.nanopay.tx.model.Transaction',
      returns: 'Promise',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: [
        {
          name: 'transaction',
          javaType: 'net.nanopay.tx.model.Transaction'
        }
      ]
    }
  ]
});
