foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'PreventLiquiditySettingsLoopRule',

  documentation: `When a liquidity settings is created or updated this rule prevents money 
    from infinitely looping through multiple accounts via Liquidity Settings.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquiditySettings liquiditySettings = (LiquiditySettings) obj;
      `
    }
  ]
});
