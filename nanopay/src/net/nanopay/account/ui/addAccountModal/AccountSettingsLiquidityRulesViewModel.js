foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountSettingsLiquidityRulesViewModel',

  documentation: `
  A view model to choose the liquidity threshold rules
  `,

  requires: [
    'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
    'net.nanopay.account.ui.addAccountModal.AccountLiquidityExistingOrNew',
  ],

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
      name: 'liquidityThresholdRules',
      label: 'I want this threshold to...',
      documentation: `
        A standard picker based on the LiquidityThresholdRules enum
      `,
      validateObj: function(liquidityThresholdRules) {
        if ( ! liquidityThresholdRules || liquidityThresholdRules == net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules.NONE ) {
          return 'Please select what to do with this threshold';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'liquidityThresholdDetails',
      label: '',
      expression: function (liquidityThresholdRules) {
        return liquidityThresholdRules === this.LiquidityThresholdRules.NONE 
        ? null 
        : this.AccountLiquidityExistingOrNew.create({ chosenLiquidityThresholdRule: liquidityThresholdRules });
      },
      validateObj: function(liquidityThresholdDetails$errors_) {
        if ( liquidityThresholdDetails$errors_ ) {
          return liquidityThresholdDetails$errors_ ? liquidityThresholdDetails$errors_ : 'Please select what to do with this threshold';
        }
      }
    }
  ],
});
