foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'LiquiditySettings',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Boolean',
      name: 'enableCashIn'
    },
    {
      class: 'Currency',
      name: 'minimumBalance'
    },
    {
      class: 'Boolean',
      name: 'enableCashOut'
    },
    {
      class: 'Currency',
      name: 'maximumBalance'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.model.CashOutFrequency',
      name: 'cashOutFrequency'
    }
  ]
});

foam.CLASS({
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
