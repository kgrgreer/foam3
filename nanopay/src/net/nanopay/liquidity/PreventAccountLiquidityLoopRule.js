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
        DAO liquiditySettingsDAO = (DAO) x.get("localLiquiditySettingsDAO");
        HashSet<DigitalAccount> highSeenAccounts = new HashSet<>();
        HashSet<DigitalAccount> lowSeenAccounts = new HashSet<>();

        LiquiditySettings liquiditySettings = (LiquiditySettings) liquiditySettingsDAO.find(account.getLiquiditySetting());
        checkForLoop(x, account, highSeenAccounts, liquiditySettings.getHighLiquidity().getPushPullAccount());
        checkForLoop(x, account, lowSeenAccounts, liquiditySettings.getLowLiquidity().getPushPullAccount());
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
