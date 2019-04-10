foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto',
  name: 'NotifyAndAuto',
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
    'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoCeiling',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAutoFloor',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleSaveTemplate'
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
        return includeCeilingRule ? this.NotifyAndAutoCeiling.create()  : null;
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
        return includeFloorRule ? this.NotifyAndAutoFloor.create()  : null;
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
        return isSavedAsTemplate ? this.LiquidityRuleSaveTemplate.create()  : null;
      },
      validateObj: function(isSavedAsTemplate, saveRuleAsTemplate$errors_) {
        if ( isSavedAsTemplate && saveRuleAsTemplate$errors_ ) {
          return saveRuleAsTemplate$errors_[0][1];
        }
      }
    },
  ]
});
