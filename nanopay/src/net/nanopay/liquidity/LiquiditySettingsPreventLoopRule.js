foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquiditySettingsPreventLoopRule',

  documentation: 'This rule prevents money from infinitely looping through multiple accounts via Liquidity Settings.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'java.util.HashSet',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings'
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
            throw new Error("Loop detected");
          }
          seenAccounts.add(account);
          LiquiditySettings liquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
          account = (DigitalAccount) accountDAO.find(liquiditySettings.getHighLiquidity().getPushPullAccount());
        }
      `
    }
  ]
});
