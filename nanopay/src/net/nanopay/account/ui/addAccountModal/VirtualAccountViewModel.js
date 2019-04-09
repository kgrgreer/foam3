foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'VirtualAccountViewModel',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model for the virtual account details on Liquid
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
      validateObj: function(accountName) {
        if ( accountName.length === 0 || !accountName.trim() ) {
          return 'Account name is required before proceeding.';
        }
      }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryPicker',
      label: 'Country',
      documentation: `
        A picker to choose countries from the countryDAO
      `,
      validateObj: function(countryPicker) {
        if ( ! countryPicker ) {
          return 'Account country required before proceeding.';
        }
      }
    },
    {
      name: 'predicatedAccountDAO',
      hidden: true,
      expression: function(user$id, accountDAO) {
        // only return other accounts in the business group
        // ! uncomment the line below once we figure this out
        // return accountDAO.where(this.EQ(this.Account.OWNER, user$id));
        return accountDAO // ! comment this later on
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'parentAccountPicker',
      label: 'Parent account',
      targetDAOKey: 'predicatedAccountDAO',
      documentation: `
        A picker to choose parent accounts based on the
        existing accounts of the user by going through the accountDAO
        and grabbing only the digital accounts owned by the user
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'currencyPicker',
      label: 'Currency',
      documentation: `
        A picker to choose a currency for the account from the currencyDAO
      `,
      validateObj: function(currencyPicker) {
        if ( ! currencyPicker ) {
          return 'Account currency required before proceeding.';
        }
      }
    },
    {
      class: 'String',
      name: 'memo',
      documentation: `
        A text area for the user to write any notes about the account
      `,
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: '8px'
      },
      required: false
    }
  ]
});
