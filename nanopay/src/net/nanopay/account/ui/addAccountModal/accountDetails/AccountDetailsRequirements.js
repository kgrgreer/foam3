foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.accountDetails',
  name: 'AccountDetailsRequirements',

  documentation: 'View model for selecting if the user wants to apply transaction limits and or liquidity settings',

  properties: [
    {
      class: 'Boolean',
      name: 'isLimitRequired',
      label: 'Add transaction limits to this account?'
    },
    {
      class: 'Boolean',
      name: 'isLiquidityRequired',
      label: 'Add liquidity threshold limits to this account?'
    }
  ]
});
