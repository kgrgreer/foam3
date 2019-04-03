foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountDetailsViewModel',
    implements: [
        'foam.mlang.Expressions'
    ],

    documentation: `
      A model for the account details on Liquid
    `,

    exports: [
        'predicatedAccountDAO'
    ],
    imports: [
        'currencyDAO',
        'accountDAO',
        'countryDAO',
        'user'
    ],

    requires: [
        'net.nanopay.account.Account'
    ],

    properties: [
        {
            class: 'String',
            name: 'accountName',
            documentation: `
                The name of the new account
            `,
        },

        {
            name: 'countryPicker',
            class: 'Reference',
            of: 'foam.nanos.auth.Country',
            documentation: `
                A picker to choose countries from the countryDAO
            `,
        },

        // ! NEED TO FILTER OUT THE ACCOUNTDAO FOR WITH ONLY USER ID
        {

            name: 'predicatedAccountDAO',
            hidden: true,
            expression: function(user$id, accountDAO) {
                // accountDAO = this.accountDAO$.get();
                // user$id = this.user$.id$
                // dot('id').get();
                return accountDAO.where(this.EQ(this.Account.OWNER, user$id)); 
            }
        },
        {
            name: 'parentAccountPicker',
            class: 'Reference',
            of: 'net.nanopay.account.Account',
            targetDAOKey: 'predicatedAccountDAO',
            documentation: `
                A picker to choose parent accounts based on the
                existing accounts of the user by going through the accountDAO
                and grabbing only the digital accounts owned by the user
            `,
        },
        {
            name: 'currencyPicker',
            class: 'Reference',
            of: 'net.nanopay.model.Currency',
            documentation: `
                A picker to choose a currency for the account from the currencyDAO
            `,
        },
        {
            name: 'memo',
            class: 'String',
            documentation: `
                A text area for the user to write any notes about the account
            `,
            view: {
                class: 'foam.u2.tag.TextArea',
                rows: '8px', cols: '151px'
            },
            required: false
        }
    ]
});
