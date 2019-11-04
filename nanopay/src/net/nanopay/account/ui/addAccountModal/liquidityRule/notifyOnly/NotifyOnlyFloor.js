foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly',
  name: 'NotifyOnlyFloor',

  documentation: `
    A view model for the account liquidity send only floor rule
  `,

  properties: [
    {
      class: 'UnitValue',
      name: 'accountBalanceFloor',
      label: 'If the balance of this account falls below',
      documentation: `
        The lower bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceFloor) {
        // ! People should be able to set the floor to zero
        if ( accountBalanceFloor < 0 ) {
          return 'Minimum balance threshold cannot be negative.';
        }
      }
    },
  ],
});
