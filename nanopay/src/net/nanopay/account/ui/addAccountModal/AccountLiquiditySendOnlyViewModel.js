foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendOnlyViewModel',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
  A view model for the high and low liquidity threshold rules for Liquid
  `,

  exports: [
    'whoReceivesPredicatedUserDAO',
  ],
  imports: [
    'currencyDAO',
    'userDAO',
    'user'
  ],

  requires: [
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
  ]
});
