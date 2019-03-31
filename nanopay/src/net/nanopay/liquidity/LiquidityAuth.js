foam.INTERFACE({
  package: 'net.nanopay.liquidity',
  name: 'LiquidityAuth',

  methods: [
    {
      name: 'liquifyAccount',
      args: [
        {
          name: 'account',
          type: 'Long'
        },
        {
          name: 'frequency',
          type: 'net.nanopay.liquidity.Frequency'
        },
        {
          // helps determine if account balance went out of the range for the first time.
          name: 'txnAmount',
          type: 'Long'
        }
      ]
    },
    {
      name: 'liquifyFrequency',
      args: [
        {
          name: 'frequency',
          type: 'net.nanopay.liquidity.Frequency'
        }
      ]
    }
  ]
});
