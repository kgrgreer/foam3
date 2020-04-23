foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'PreventAccountLiquidityLoopRule',

  documentation: 'This rule prevents money from infinitely looping through multiple accounts via Liquidity Settings.',

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
        HashSet<DigitalAccount> seenAccounts = new HashSet<>();
        while ( account != null ) {
          if ( seenAccounts.contains(account) ) {
            throw new RuntimeException(this.getMessage());
          }
          seenAccounts.add(account);
          LiquiditySettings liquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
          account = (DigitalAccount) accountDAO.find(liquiditySettings.getHighLiquidity().getPushPullAccount());
        }
      `
    }
  ]
});
