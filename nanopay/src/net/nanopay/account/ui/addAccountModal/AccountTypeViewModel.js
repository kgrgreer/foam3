foam.CLASS({
    package: 'net.nanopay.account.ui.addAccountModal',
    name: 'AccountTypeViewModel',
    // extends: 'foam.u2.View',
  
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

    // methods: [
    //   function initE() {
    //     this
    //       .add(this.ACCOUNT_TYPE_PICKER)
    //   }
    // ]
});
