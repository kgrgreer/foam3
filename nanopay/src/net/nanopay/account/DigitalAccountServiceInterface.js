foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'DigitalAccountServiceInterface',

  methods: [
    {
      name: 'findDefault',
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
