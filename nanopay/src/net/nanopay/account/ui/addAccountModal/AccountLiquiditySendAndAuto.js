foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendAndAuto',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
  A view model for the high and low liquidity threshold rules for Liquid
  `,

  imports: [
    'currencyDAO'
  ],

  requires: [
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendAndAutoCeilingRule',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendAndAutoFloorRule',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySaveRuleTemplate'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'includeCeilingRule',
      label: 'Include high liquidity threshold rules',
      validateObj: function(includeCeilingRule, includeFloorRule) {
        if ( ! includeCeilingRule && ! includeFloorRule ) {
          return 'You must at least include either a high or low liquidity threshold.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'ceilingRuleDetails',
      label: '',
      expression: function (includeCeilingRule) {
        return includeCeilingRule ? this.AccountLiquiditySendAndAutoCeilingRule.create()  : null;
      },
      validateObj: function(ceilingRuleDetails$errors_) {
        if ( ceilingRuleDetails$errors_ ) {
          return ceilingRuleDetails$errors_[0][1];
        }
      }
    },
    {
      class: 'Boolean',
      name: 'includeFloorRule',
      label: 'Include low liquidity threshold rules',
      validateObj: function(includeCeilingRule, includeFloorRule) {
        if ( ! includeCeilingRule && ! includeFloorRule ) {
          return 'You must at least include either a high or low liquidity threshold.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'floorRuleDetails',
      label: '',
      expression: function (includeFloorRule) {
        return includeFloorRule ? this.AccountLiquiditySendAndAutoFloorRule.create()  : null;
      },
      validateObj: function(floorRuleDetails$errors_) {
        if ( floorRuleDetails$errors_ ) {
          return floorRuleDetails$errors_[0][1];
        }
      }
    },
    {
      class: 'Boolean',
      name: 'isSavedAsTemplate',
      label: 'Save this threshold rule as a template',
    },
    {
      class: 'FObjectProperty',
      name: 'saveRuleAsTemplate',
      label: '',
      expression: function (isSavedAsTemplate) {
        return isSavedAsTemplate ? this.AccountLiquiditySaveRuleTemplate.create()  : null;
      },
      validateObj: function(isSavedAsTemplate, saveRuleAsTemplate$errors_) {
        if ( isSavedAsTemplate && saveRuleAsTemplate$errors_ ) {
          return saveRuleAsTemplate$errors_[0][1];
        }
      }
    },
  ]
});
