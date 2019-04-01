foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettings',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount'
  ],
  imports: [
    'liquiditySettingsDAO'
  ],

  //relationship: 1:* LiquiditySettings : DigitalAccount

  //ids: ['account'],

  plural: 'Liquidity Settings',

  css: `
  .foam-u2-view-RichChoiceView-container {
    z-index:1;
  }
  `,
  properties: [
    {
      class: 'Long',
      name: 'id',
      label: 'ID',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'name',
      value: 'name'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.Frequency',
      name: 'cashOutFrequency',
      documentation: 'Determines how often a automatic cash out can occur.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'highLiquidity',
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create({
          resetBalance: 0,
          threshold: 0,
          enable: false,
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.liquidity.Liquidity',
      name: 'lowLiquidity',
      factory: function() {
        return net.nanopay.liquidity.Liquidity.create();
      }
    }
  ]
});

