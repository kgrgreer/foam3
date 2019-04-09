foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendOnlyCeilingRule',

  documentation: `
    A view model for the account liquidity send only ceiling rule
  `,

  properties: [
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
    }
  ]
});
