foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySaveRuleTemplate',

  documentation: `
    A view model for the saving a threshold rule as a template
  `,

  properties: [
    {
      class: 'String',
      name: 'thresholdRuleName',
      label: 'Threshold rule name',
      documentation: `
        The name for the threshold rule
      `,
      validateObj: function(thresholdRuleName) {
        if ( thresholdRuleName.length === 0 || ! thresholdRuleName.trim() ) {
          return 'Please name this threshold rule.';
        }
      }
    }
  ]
});
