foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendOnlyFloorRule',

  documentation: `
    A view model for the account liquidity send only floor rule
  `,

  properties: [
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
  ],
});
