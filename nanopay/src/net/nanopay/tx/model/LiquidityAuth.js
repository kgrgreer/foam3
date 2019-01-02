foam.INTERFACE({
  package: 'net.nanopay.tx.model',
  name: 'LiquidityAuth',

  methods: [
    {
      name: 'liquifyAccount',
      args: [
        {
          name: 'account',
          javaType: 'long'
        },
        {
          name: 'frequency',
          javaType: 'net.nanopay.tx.model.CashOutFrequency'
        }
      ]
    },
    {
      name: 'liquifyFrequencies',
      args: [
        {
          name: 'frequency',
          javaType: 'net.nanopay.tx.model.CashOutFrequency'
        }
      ]
    }
  ]
});
