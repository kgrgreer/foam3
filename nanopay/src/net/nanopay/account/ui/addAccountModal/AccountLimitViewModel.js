foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountLimitViewModel',
  
    documentation: `
      A model for the maximum transaction size for an account being created in Liquid
    `,

    properties: [
      {
        class: 'Currency',
        name: 'maxTransactionSize',
        documentation: `
            The currency value of the maximum transaction size
        `
      },
    ],
});
