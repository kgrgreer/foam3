foam.ENUM({
    package: 'net.nanopay.account.ui.addAccountModal.liquidityRule',
    name: 'LiquidityRules',

    documentation: `
        Liquidity threshold rules for when creating an account in Liquid
    `,

    values: [
        { name: "NONE", label: 'Select a rule' },
        { name: "NOTIFY", label: 'Send notifications' },
        { name: "NOTIFY_AND_AUTO", label: 'Send notifications & automatic transactions' },
    ]
});
