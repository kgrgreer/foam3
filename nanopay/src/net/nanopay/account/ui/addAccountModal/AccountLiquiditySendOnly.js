foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquiditySendOnly',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
  A view model for the high and low liquidity threshold rules for Liquid
  `,

  exports: [
    'whoReceivesPredicatedUserDAO',
  ],
  imports: [
    'currencyDAO',
    'userDAO',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendOnlyFloorRule',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendOnlyCeilingRule',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySaveRuleTemplate'
  ],

  properties: [
    {

      name: 'whoReceivesPredicatedUserDAO',
      hidden: true,
      expression: function (user$group, userDAO) {
        // only return other users in the business group
        // uncomment the line below once we figure this out
        // return user.where(this.EQ(this.User.GROUP, user$group));
        return userDAO; // ! comment this later on
      }
    },
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
      expression: function (includeCeilingRule) {
        return includeCeilingRule ? this.AccountLiquiditySendOnlyCeilingRule.create()  : null;
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
      expression: function (includeFloorRule) {
        return includeFloorRule ? this.AccountLiquiditySendOnlyFloorRule.create()  : null;
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
