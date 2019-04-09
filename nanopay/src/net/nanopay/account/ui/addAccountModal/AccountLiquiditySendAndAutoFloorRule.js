foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendAndAutoFloorRule',
    implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model for the account liquidity send and auto transaction floor rule
  `,

  exports: [
    'otherAccountsPredicatedAccountDAO'
  ],
  imports: [
    'currencyDAO',
    'accountDAO',
    'user'
  ],

  requires: [
    'net.nanopay.account.Account',
  ],

  properties: [
    {

      name: 'otherAccountsPredicatedAccountDAO',
      hidden: true,
      expression: function(user$id, accountDAO) {
        // the owner will be the business
        return accountDAO.where(this.EQ(this.Account.OWNER, user$id));
      }
    },
    {
      class: 'Currency',
      name: 'accountBalanceFloor',
      label: 'If the balance of this account falls below',
      documentation: `
        The lower bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceCeiling, accountBalanceFloor) {
        if (  ( accountBalanceCeiling && accountBalanceFloor ) && accountBalanceCeiling > 0  && accountBalanceFloor >= accountBalanceCeiling ) {
          return 'Please define a maximum balance threshold greater than the minimum balance threshold.';
        }
      }
    },
    {
      class: 'Currency',
      name: 'resetAccountBalanceFloor',
      label: 'Reset account balance to',
      documentation: `
        The amount to reset the account balance upon hitting the floor
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'floorMoveFundsTo',
      label: 'by adding new funds from',
      targetDAOKey: 'otherAccountsPredicatedAccountDAO',
      documentation: `
        A picker to choose which account to transfer funds from if this account
        hits the lower bound liquidity threshold
      `,
    },
  ]
});