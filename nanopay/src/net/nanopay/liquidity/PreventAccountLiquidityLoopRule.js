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
        checkHighLiquidityLoop(x, account);
        checkLowLiquidityLoop(x, account);
      `
    },
    {
      name: 'checkHighLiquidityLoop',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.DigitalAccount'
        }
      ],
      javaCode: `
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        DAO liquiditySettingsDAO = (DAO) x.get("localLiquiditySettingsDAO");
        HashSet<DigitalAccount> seenAccounts = new HashSet<>();
        seenAccounts.add(account);
        LiquiditySettings liquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
        account = (DigitalAccount) accountDAO.find(liquiditySettings.getHighLiquidity().getPushPullAccount());
        while ( account != null ) {
          if ( seenAccounts.contains(account) ) {
            throw new RuntimeException(this.getMessage());
          }
          seenAccounts.add(account);
          LiquiditySettings nextLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
          account = (DigitalAccount) accountDAO.find(nextLiquiditySettings.getHighLiquidity().getPushPullAccount());
        }
      `
    },
    {
      name: 'checkLowLiquidityLoop',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'account',
          type: 'net.nanopay.account.DigitalAccount'
        }
      ],
      javaCode: `
      DAO accountDAO = (DAO) x.get("localAccountDAO");
      DAO liquiditySettingsDAO = (DAO) x.get("localLiquiditySettingsDAO");
      HashSet<DigitalAccount> seenAccounts = new HashSet<>();
      seenAccounts.add(account);
      LiquiditySettings liquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
      account = (DigitalAccount) accountDAO.find(liquiditySettings.getLowLiquidity().getPushPullAccount());
      while ( account != null ) {
        if ( seenAccounts.contains(account) ) {
          throw new RuntimeException(this.getMessage());
        }
        seenAccounts.add(account);
        LiquiditySettings nextLiquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
        account = (DigitalAccount) accountDAO.find(nextLiquiditySettings.getLowLiquidity().getPushPullAccount());
      }
      `
    }
  ]
});
