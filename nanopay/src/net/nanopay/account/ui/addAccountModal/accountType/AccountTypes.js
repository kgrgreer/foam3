foam.ENUM({
    package: 'net.nanopay.account.ui.addAccountModal.accountType',
    name: 'AccountTypes',

    documentation: `
        Account types able to be created through Liquid
    `,

    values: [
        { name: 'SHADOW_ACCOUNT', label: 'Shadow account' },
        { name: 'AGGREGATE_ACCOUNT', label: 'Aggregate account' },
        { name: 'VIRTUAL_ACCOUNT', label: 'Virtual account' },
    ]
});
