foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityExistingOrNew',
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
    'net.nanopay.account.ui.addAccountModal.AccountSettingsLiquidityRulesViewModel',
    'net.nanopay.account.ui.addAccountModal.AccountLiquidityExistingRule'
  ],


  properties: [
    {
      class: 'Boolean',
      name: 'isRuleTypeSelected',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isNewSelected',
      label: 'Create a new threshold rule for this account',
      documentation: `
        A boolean to indicate if the user is creating a new threshold rule for this account
      `,
      postSet: function(_, n) {
        if ( n ) {
          this.isExistingSelected = false;
        }
      },
      validateObj: function(isNewSelected, isExistingSelected) {
        if ( ! isNewSelected && ! isExistingSelected ) {
          return 'You need to create a new threshold template or choose an existing one.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'isExistingSelected',
      label: 'Use an existing threshold rule for this account',
      documentation: `
        A boolean to indicate if the user is creating a new threshold rule for this account
      `,
      postSet: function(_, n) {
        if ( n ) {
          this.isNewSelected = false;
        }
      },
      validateObj: function(isNewSelected, isExistingSelected) {
        if ( ! isNewSelected && ! isExistingSelected ) {
          return 'You need to create a new threshold template or choose an existing one.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'newRuleDetails',
      label: '',
      expression: function (isNewSelected) {
        // make a switch here
        if (!isNewSelected) return null;
        return isNewSelected ? this.AccountSettingsLiquidityRulesViewModel.create() : null;
      },
      validateObj: function(newRuleDetails$errors_) {
        if ( newRuleDetails$errors_ ) {
          return newRuleDetails$errors_[0][1];
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'existingRuleDetails',
      label: '',
      expression: function (isExistingSelected) {
        // make a switch here
        return isExistingSelected ? this.AccountLiquidityExistingRule.create() : null;
      },
      validateObj: function(existingRuleDetails$errors_) {
        if ( existingRuleDetails$errors_ ) {
          return existingRuleDetails$errors_[0][1];
        }
      }
    }
  ]
});
