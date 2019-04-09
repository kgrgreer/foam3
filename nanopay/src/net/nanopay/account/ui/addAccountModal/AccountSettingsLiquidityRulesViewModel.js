foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountSettingsLiquidityRulesViewModel',

  documentation: `
  A view model to choose the liquidity threshold rules
  `,

  requires: [
    'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendOnlyViewModel',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendAndAutoViewModel'
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
      expression: function (liquidityThresholdRules) {
        let viewModel;
        switch(liquidityThresholdRules) {
          case this.LiquidityThresholdRules.NONE:
            viewModel = null;
            break;
          case this.liquidityThresholdRules.NOTIFY:
            viewModel = this.AccountLiquiditySendOnlyViewModel.create();
            break;
          case this.liquidityThresholdRules.NOTIFY_AND_AUTO:
            viewModel = this.AccountLiquiditySendAndAutoViewModel.create();
            break;
          default:
            viewModel = null;
            break;
        }
        return viewModel;
      },
      validateObj: function(liquidityThresholdDetails$errors_) {
        if ( liquidityThresholdDetails$errors_ ) {
          return liquidityThresholdDetails$errors_ ? liquidityThresholdDetails$errors_ : 'Please select what to do with this threshold';
        }
      }
    }
  ],
});
