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
      validateObj: function(accountBalanceFloor) {
        if ( accountBalanceFloor === 0 ) {
          return 'Please define a minimum balance threshold.';
        }
      }
    },
  ],
});
