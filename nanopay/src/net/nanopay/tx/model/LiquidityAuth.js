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
