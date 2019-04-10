foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal.accountType',
    name: 'AccountType',

    documentation: `
      A view model for the account type on Liquid
    `,

    properties: [
      {
        class: 'Enum',
        of: 'net.nanopay.account.ui.addAccountModal.accountType.AccountTypes',
        name: 'accountTypePicker',
        documentation: `
          A standard picker based on the AccountType enum
        `,
        validateObj: function(accountTypePicker) {
          if ( ! accountTypePicker ) {
            return 'Please select an account type to proceed.';
          }
        }
      },
    ],
});
