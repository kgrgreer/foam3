foam.INTERFACE({
  package: 'net.nanopay.account',
  name: 'DigitalAccountServiceInterface',

  methods: [
    {
      name: 'findDefault',
      async: true,
      type: 'net.nanopay.account.DigitalAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'user',
          type: 'foam.nanos.auth.User'
        },
        {
          name: 'denomination',
          type: 'String'
        }
      ]
    }
  ]
});
