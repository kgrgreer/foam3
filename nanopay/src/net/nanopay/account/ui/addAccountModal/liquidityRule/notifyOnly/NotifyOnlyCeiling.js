foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly',
  name: 'NotifyOnlyCeiling',

  documentation: `
    A view model for the account liquidity send only ceiling rule
  `,

  properties: [
    {
      class: 'UnitValue',
      name: 'accountBalanceCeiling',
      label: 'If the balance of this account reaches',
      documentation: `
        The upper bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceCeiling) {
        if ( accountBalanceCeiling <= 0 ) {
          return 'Maximum balance threshold must be greater than 0';
        }
      }
    }
  ]
});
