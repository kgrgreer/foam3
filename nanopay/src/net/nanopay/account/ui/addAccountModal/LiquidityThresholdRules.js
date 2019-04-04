foam.ENUM({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'LiquidityThresholdRules',

    documentation: `
        Liquidity threshold rules for when creating an account in Liquid
    `,

    values: [
        { name: false, label: 'Shadow account' },
        { name: true, label: 'Aggregate account' },
    ]
});
