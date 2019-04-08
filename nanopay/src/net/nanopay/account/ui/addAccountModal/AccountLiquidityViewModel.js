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
    'whoReceivesPredicatedUserDAO',
    'otherAccountsPredicatedAccountDAO'
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
        // return user.where(this.EQ(this.User.GROUP, user$group));
        return userDAO; // ! comment this later on
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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'whoReceivesNotification',
      label: 'Who should receive notifications',
      targetDAOKey: 'whoReceivesPredicatedUserDAO',
      documentation: `
        A picker to choose who in the organization will
        receive the notifications
      `,
      validateObj: function(whoReceivesNotification) {
        if ( ! whoReceivesNotification ) {
          return 'Please select a person to receive the notifications when thresholds are met.';
        }
      }
    },
    {
      class: 'Currency',
      name: 'accountBalanceCeiling',
      label: 'If the balance of this account reaches',
      documentation: `
        The upper bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceCeiling, accountBalanceFloor) {
        if ( ( accountBalanceCeiling && accountBalanceFloor ) && accountBalanceFloor > 0  && accountBalanceCeiling <= accountBalanceFloor ) {
          return 'Please define a maximum balance threshold greater than the minimum balance threshold.';
        }
      }
    },
    {
      class: 'Currency',
      name: 'resetAccountBalanceCeiling',
      label: 'Reset account balance to',
      documentation: `
        The amount to reset the account balance upon hitting the ceiling
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'ceilingMoveFundsTo',
      label: 'by moving the excess funds into',
      targetDAOKey: 'otherAccountsPredicatedAccountDAO',
      documentation: `
        A picker to choose which account will excess funds be moved to
        upon hitting the upper bound liquidity threshold
      `,
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
