foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInterface',

  methods: [
    {
      name: 'getDefault',
      returns: 'Promise',
      javaReturns: 'net.nanopay.account.DigitalAccount',
      args: [
        {
          name: 'denomination',
          javaType: 'String'
        }
      ]
    }
  ]
});
