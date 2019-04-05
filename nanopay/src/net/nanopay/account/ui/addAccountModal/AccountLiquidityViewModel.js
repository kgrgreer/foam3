foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountLiquidityViewModel',
    implements: [
        'foam.mlang.Expressions'
    ],

    documentation: `
      A view model for the high and low liquidity threshold rules for Liquid
    `,

    exports: [
        'predicatedAccountDAO'
    ],
    imports: [
        'currencyDAO',
        'accountDAO',
        'userDAO',
        'user'
    ],

    requires: [
        'net.nanopay.account.Account',
        'foam.nanos.auth.User'
    ],

    properties: [
        // ! NEED TO FILTER OUT THE ACCOUNTDAO FOR WITH ONLY USER ID
        {

            name: 'whoReceivesPredicatedUserDAO',
            hidden: true,
            expression: function (user$group, userDAO) {
                // only return other users in the business group
                // uncomment the line below once we figure this out
                // return userDAO.where(this.EQ(this.User.GROUP, user$group));
                return userDAO
            }
        },
        {

            name: 'otherAccountsPredicatedAccountDAO',
            hidden: true,
            expression: function(user$id, accountDAO) {
                // the owner will be the business
                return accountDAO.where(this.EQ(this.Account.OWNER, user$id)); 
            }
        },
        {
            name: 'whoReceivesNotification',
            class: 'Reference',
            of: 'foam.nanos.auth.User',
            targetDAOKey: 'whoReceivesPredicatedUserDAO',
            documentation: `
                A picker to choose who in the organization will
                receive the notifications
            `,
        },
        {
            class: 'Currency',
            name: 'accountBalanceCeiling',
            documentation: `
                The upper bound of the rule enforcement for liquidity settings
            `
        },
        {
            class: 'Currency',
            name: 'resetAccountBalanceCeiling',
            documentation: `
                The amount to reset the account balance upon hitting the ceiling
            `
        },
        {
            name: 'ceilingMoveFundsTo',
            class: 'Reference',
            of: 'net.nanopay.account.Account',
            targetDAOKey: 'otherAccountsPredicatedAccountDAO',
            documentation: `
                A picker to choose which account will excess funds be moved to
                upon hitting the upper bound liquidity threshold
            `,
        },
        {
            class: 'Currency',
            name: 'accountBalanceFloor',
            documentation: `
                The lower bound of the rule enforcement for liquidity settings
            `
        },
        {
            class: 'Currency',
            name: 'resetAccountBalanceFloor',
            documentation: `
                The amount to reset the account balance upon hitting the floor
            `
        },
        {
            name: 'floorMoveFundsTo',
            class: 'Reference',
            of: 'net.nanopay.account.Account',
            targetDAOKey: 'otherAccountsPredicatedAccountDAO',
            documentation: `
                A picker to choose which account to transfer funds from if this account
                hits the lower bound liquidity threshold
            `,
        },
    ]
});
