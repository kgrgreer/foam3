foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'LiquiditySettings',

  plural: 'Liquidity Settings',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enableCashIn',
      documentation: 'Determines automatic cash in processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'minimumBalance',
      documentation: 'Determines minimum balance' +
         ' required for automatic cash in.'
    },
    {
      class: 'Boolean',
      name: 'enableCashOut',
      documentation: 'Determines automatic cash out processing on accounts.'
    },
    {
      class: 'Currency',
      name: 'maximumBalance',
      documentation: 'Determines maximum balance' +
          ' required for automatic cash out.'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.model.CashOutFrequency',
      name: 'cashOutFrequency',
      documentation: 'Determines how often a automatic cash out can occur.'
    },
    {
      class: 'Long',
      name: 'bankAccountId',
      documentation: 'Account associated to setting.'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'GroupRefine',
  refines: 'foam.nanos.auth.Group',

  properties: [
    {
      name: 'liquiditySettings',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.LiquiditySettings',
      factory: function() { return net.nanopay.tx.model.LiquiditySettings.create(); }
    }
  ]
});
