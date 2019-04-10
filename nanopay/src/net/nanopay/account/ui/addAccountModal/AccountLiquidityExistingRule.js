foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityExistingRule',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model to choose a liquidity threshold rule from a set of existing threshold rules from the business
  `,

  exports: [
    'predicatedLiquiditySettingsDAO',
  ],

  imports: [
    'liquiditySettingsDAO',
    'liquiditySettings'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRule',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
      name: 'chosenLiquidityThresholdRule',
      hidden: true
    },
    {
      name: 'predicatedLiquiditySettingsDAO',
      hidden: true,
      // ! ask how to grab the id from liquiditySettings relationship acount
      expression: function(liquiditySettingsDAO) {
        // only return other accounts in the business group
        // ! uncomment the line below once we figure this out
        // return liquiditySettingsDAO.where(this.EQ(this.User.GROUP, user$id));
        return liquiditySettingsDAO.where(this.NEQ(this.LiquiditySettings.NAME, '')); // ! comment this later on
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.LiquiditySettings',
      name: 'existingThresholdRule',
      label: 'Threshold rule name',
      targetDAOKey: 'predicatedLiquiditySettingsDAO',
      documentation: `
        A picker to choose which account will excess funds be moved to
        upon hitting the upper bound liquidity threshold
      `,
      validateObj: function(existingThresholdRule) {
        if ( ! existingThresholdRule ) {
          return 'Please select an existing threshold.';
        }
      }
    },
  ],
});
