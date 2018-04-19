foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'LiquidityAuth',

  methods: [
    {
      name: 'liquifyUser',
      args: [
        {
          name: 'UserId',
          javaType: 'Long'
        }
      ]
    }
  ]
});