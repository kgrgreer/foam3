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
          name: 'userId',
          javaType: 'Long'
        },
        {
          name: 'denomination',
          javaType: 'String'
        }
      ]
    }
  ]
});
