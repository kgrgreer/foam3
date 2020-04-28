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
          LiquiditySettings liquiditySettingsToCheck = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
          checkForLoop(x, account, highSeenAccounts, liquiditySettingsToCheck.getHighLiquidity().getPushPullAccount());
          checkForLoop(x, account, lowSeenAccounts, liquiditySettingsToCheck.getLowLiquidity().getPushPullAccount());
        }
      `
    },
    {
      name: 'checkForLoop',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.DigitalAccount'
        },
        {
          name: 'seenAccounts',
          type: 'java.util.HashSet'
        },
        {
          name: 'pushPullId',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        while ( account != null ) {
          if ( seenAccounts.contains(account) ) {
            throw new RuntimeException(this.getMessage());
          }
          seenAccounts.add(account);
          account = (DigitalAccount) accountDAO.find(pushPullId);
        }
      `
    }
  ]
});
