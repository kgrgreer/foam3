foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountTypeViewModel',
  
    documentation: `
      A model for the account type on Liquid
    `,

    properties: [
      {
        class: 'Enum',
        of: 'net.nanopay.account.ui.addAccountModal.AccountType',
        name: 'accountTypePicker',
        documentation: `
          A standard picker based on the AccountType enum
        `,
      },
    ],
});
