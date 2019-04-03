foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountSettingsRequirementViewModel',

  documentation: 'View model for selecting if the user wants to apply transaction limits and or liquidity settings',

  properties: [
    {
      class: 'Boolean',
      name: 'isLimitRequired'
    },
    {
      class: 'Boolean',
      name: 'isLiquidityRequired'
    }
  ]
});
