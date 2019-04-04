foam.ENUM({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'LiquidityThresholdRules',

    documentation: `
        Liquidity threshold rules for when creating an account in Liquid
    `,

    values: [
        { name: "SEND", label: 'Send notifications' },
        { name: "SEND_AND_AUTO", label: 'Send notifications & automatic transactions' },
    ]
});
