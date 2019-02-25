foam.INTERFACE({
  package: 'net.nanopay.tx.model',
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
          type: 'net.nanopay.tx.model.Frequency'
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
          type: 'net.nanopay.tx.model.Frequency'
        }
      ]
    }
  ]
});
