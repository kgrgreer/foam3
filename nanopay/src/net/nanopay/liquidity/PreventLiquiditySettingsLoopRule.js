foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'PreventLiquiditySettingsLoopRule',

  documentation: `When a liquidity settings is created or updated this rule prevents money 
    from infinitely looping through multiple accounts via Liquidity Settings.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'java.util.HashSet',
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
        LiquiditySettings liquiditySettings = (LiquiditySettings) obj;
        DAO accountDAO = (DAO) x.get("accountDAO");
        DAO liquiditySettingsDAO = (DAO) x.get("liquiditySettingsDAO");
        HashSet<DigitalAccount> highSeenAccounts = new HashSet<>();
        HashSet<DigitalAccount> lowSeenAccounts = new HashSet<>();
        ArraySink sink = (ArraySink) accountDAO.where(
          foam.mlang.MLang.EQ(DigitalAccount.LIQUIDITY_SETTING, liquiditySettings.getId())
        ).select(new ArraySink());

        for ( int i = 0; i < sink.getArray().size(); i++ ) {
          DigitalAccount account = (DigitalAccount) sink.getArray().get(i);
          while ( account != null ) {
            if( highSeenAccounts.contains(account) ) {
              throw new RuntimeException(this.getMessage());
            }
            highSeenAccounts.add(account);
            LiquiditySettings highLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
            account = (DigitalAccount) accountDAO.find(highLiquiditySettings.getHighLiquidity().getPushPullAccount());
          }
          while ( account != null ) {
            if ( lowSeenAccounts.contains(account) ) {
              throw new RuntimeException(this.getMessage());
            }
            lowSeenAccounts.add(account);
            LiquiditySettings lowLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
            account = (DigitalAccount) accountDAO.find(lowLiquiditySettings.getLowLiquidity().getPushPullAccount());
          }
        }

      `
    }
  ]
});
