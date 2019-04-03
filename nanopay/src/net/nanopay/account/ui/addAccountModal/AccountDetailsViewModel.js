foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountDetailsViewModel',
    // extends: 'foam.u2.View',

    documentation: `
      A model for the account details on Liquid
    `,

    imports: [
        'currencyDAO',
        'accountDAO',
        'countryDAO',
    ],

    properties: [
        // Account Name string
        {
            class: 'String',
            name: 'accountName',
            documentation: `
                The name of the new account
            `,
        },

        // Country pull from countryDAO
        {
            name: 'countryPicker',
            documentation: `
                A picker to choose countries from the countryDAO
            `,
            view: function (_, X) {
                return foam.u2.view.ChoiceView.create({
                    dao: X.countryDAO,
                    objToChoice: function (a) {
                        return [a.id, a.name];
                    },
                    placeholder: 'Select',
                    defaultValue: 'Select'
                });
            },
        },

        // Parent accounts from accountDAO belonging to the owning user
        // ! IMPORTANT: is this required? What about the first time a user creates an account?
        // ! first account has to be a shadow account?
        {
            name: 'parentAccountPicker',
            documentation: `
                A picker to choose parent accounts based on the
                existing accounts of the user by going through the accountDAO
                and grabbing only the digital accounts owned by the user
            `,
            view: function (_, X) {
                return foam.u2.view.ChoiceView.create({
                    dao: X.accountDAO,
                    objToChoice: function (a) {
                        return [a.id, a.name];
                    },
                    placeholder: 'Select',
                    defaultValue: 'Select'
                });
            },
        },

        // Currency pull from currencyDAO
        {
            name: 'currencyPicker',
            documentation: `
                A picker to choose a currency for the account from the currencyDAO
            `,
            view: function (_, X) {
                return foam.u2.view.ChoiceView.create({
                    dao: X.currencyDAO,
                    objToChoice: function (a) {
                        return [a.id, a.name];
                    },
                    placeholder: 'Select',
                    defaultValue: 'Select'
                });
            },
        },

        // Memo
        {
            class: 'String',
            name: 'memo',
            documentation: `
                A text area for the user to write any notes about the account
            `,
            view: {
                class: 'foam.u2.tag.TextArea',
                rows: '8px', cols: '151px'
            },
            required: false
        }
    ],

    // methods: [
    //     function initE() {
    //         this
    //             .add(this.ACCOUNT_NAME)
    //             .add(this.COUNTRY_PICKER)
    //             .add(this.PARENT_ACCOUNT_PICKER)
    //             .add(this.CURRENCY_PICKER)
    //             .add(this.MEMO)
    //             .end();
    //     }
    // ]
});
