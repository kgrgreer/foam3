foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'PreventLiquiditySettingsLoopRule',
  extends: 'net.nanopay.liquidity.PreventAccountLiquidityLoopRule',

  documentation: `When a liquidity settings is created or updated this rule prevents money 
    from infinitely looping through multiple accounts via Liquidity Settings.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquiditySettings liquiditySetting = (LiquiditySettings) obj;
        DAO accountDAO = (DAO) x.get("accountDAO");

        ArraySink sink = (ArraySink) accountDAO.where(
          foam.mlang.MLang.EQ(DigitalAccount.LIQUIDITY_SETTING, liquiditySetting.getId())
        ).select(new ArraySink());

        for ( int i = 0; i < sink.getArray().size(); i++ ) {
          DigitalAccount account = (DigitalAccount) sink.getArray().get(i);
          checkHighLiquidityLoop(x, account, this.getMessage());
          checkLowLiquidityLoop(x, account, this.getMessage());
        }
      `
    }
  ]
});
