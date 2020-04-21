foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettingsPreventLoopRule',

  documentation: 'This rule prevents money from infinitely looping through multiple accounts via Liquidity Settings.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      `
    }
  ]
});
