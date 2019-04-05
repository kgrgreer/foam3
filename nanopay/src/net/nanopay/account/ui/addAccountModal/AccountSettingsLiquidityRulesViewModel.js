foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountSettingsLiquidityRulesViewModel',

    documentation: `
      A view model to choose the liquidity threshold rules
    `,

    properties: [
        {
            class: 'Enum',
            of: 'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
            name: 'liquidityThresholdRules',
            documentation: `
            A standard picker based on the LiquidityThresholdRules enum
          `,
        },
    ],
});
