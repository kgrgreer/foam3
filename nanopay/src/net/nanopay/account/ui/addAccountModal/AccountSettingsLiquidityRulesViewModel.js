foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountSettingsLiquidityRulesViewModel',

    documentation: `
      A view model to choose the liquidity threshold rules
    `,

    requires: [
      'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
      'net.nanopay.account.ui.addAccountModal.AccountLiquidityViewModel'
    ],

    properties: [
        {
          class: 'Enum',
          of: 'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
          name: 'liquidityThresholdRules',
          documentation: `
            A standard picker based on the LiquidityThresholdRules enum
          `
        },
        {
          class: 'FObjectProperty',
          name: 'liquidityThresholdDetails',
          expression: function (liquidityThresholdRules) {
            return liquidityThresholdRules === this.LiquidityThresholdRules.NONE ? null : this.AccountLiquidityViewModel.create(); 
          }
        }
    ],
});
