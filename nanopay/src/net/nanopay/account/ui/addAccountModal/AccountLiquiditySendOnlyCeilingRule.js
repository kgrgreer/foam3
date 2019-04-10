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
      validateObj: function(accountBalanceCeiling) {
        if ( accountBalanceCeiling ) {
          return 'Please define a maximum balance threshold.';
        }
      }
    }
  ]
});
