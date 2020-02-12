foam.CLASS({
  package: 'net.nanopay.liquidity.ui.liquidity',
  name: 'LiquidityDetailView',
  extends: 'foam.u2.detail.VerticalDetailView',

  exports: [
    'denominationToFilterBySlot'
  ],

  properties: [
    {
      name: 'denominationToFilterBySlot'
    }
  ]
});

