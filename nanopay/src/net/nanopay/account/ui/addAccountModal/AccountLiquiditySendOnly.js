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
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'whoReceivesNotification',
      label: 'Who should receive notifications',
      targetDAOKey: 'whoReceivesPredicatedUserDAO',
      documentation: `
        A picker to choose who in the organization will
        receive the notifications
      `,
      validateObj: function(whoReceivesNotification) {
        if ( ! whoReceivesNotification ) {
          return 'Please select a person to receive the notifications when thresholds are met.';
        }
      }
    },
    {
      class: 'Boolean',
      name: 'includeCeilingRule',
      label: 'Include high liquidity threshold rules'
    },
    {
      class: 'FObjectProperty',
      name: 'ceilingRuleDetails',
      label: "",
      expression: function (includeCeilingRule) {
        return includeCeilingRule ? this.AccountLiquiditySendOnlyCeilingRule.create()  : null;
      },
    },
    {
      class: 'Boolean',
      name: 'includeFloorRule',
      label: 'Include low liquidity threshold rules',
    },
    {
      class: 'FObjectProperty',
      name: 'floorRuleDetails',
      label: "",
      expression: function (includeFloorRule) {
        return includeFloorRule ? this.AccountLiquiditySendOnlyFloorRule.create()  : null;
      },
    },
    {
      class: 'Boolean',
      name: 'isSavedAsTemplate',
      label: 'Save this threshold rule as a template',
    },
    {
      class: 'FObjectProperty',
      name: 'saveRuleAsTemplate',
      label: "",
      expression: function (isSavedAsTemplate) {
        return isSavedAsTemplate ? this.AccountLiquiditySaveRuleTemplate.create()  : null;
      },
    },
  ]
});
