foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInterface',

  methods: [
    {
      name: 'getDefault',
      javaReturns: 'net.nanopay.account.DigitalAccount',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'denomination',
          javaType: 'String'
        }
      ]
    }
  ]
});
