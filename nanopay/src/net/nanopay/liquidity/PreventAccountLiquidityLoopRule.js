foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'PreventAccountLiquidityLoopRule',

  documentation: `When an account is created or updated this rule prevents money 
    from infinitely looping through multiple accounts via Liquidity Settings.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
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
        DigitalAccount account = (DigitalAccount) obj;
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO liquiditySettingsDAO = (DAO) x.get("localLiquiditySettingsDAO");
        HashSet<DigitalAccount> highSeenAccounts = new HashSet<>();
        HashSet<DigitalAccount> lowSeenAccounts = new HashSet<>();
        while ( account != null ) {
          if ( highSeenAccounts.contains(account) ) {
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
      `
    }
  ]
});
