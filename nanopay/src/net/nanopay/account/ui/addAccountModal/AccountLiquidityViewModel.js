foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountLiquidityViewModel',

    documentation: `
      A view model for the high and low liquidity threshold rules for Liquid
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
