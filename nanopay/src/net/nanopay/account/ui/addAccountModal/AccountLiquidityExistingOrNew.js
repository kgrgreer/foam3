foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AccountLiquidityExistingOrNew',
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
    'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendAndAuto',
    'net.nanopay.account.ui.addAccountModal.AccountLiquiditySendOnly',
    'net.nanopay.account.ui.addAccountModal.AccountLiquidityExistingRule'
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
      class: 'Enum',
      of: 'net.nanopay.account.ui.addAccountModal.LiquidityThresholdRules',
      name: 'chosenLiquidityThresholdRule',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isRuleTypeSelected',
      hidden: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'whoReceivesNotification',
      label: 'Who should receive notifications about this threshold',
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
      name: 'isNewSelected',
      label: 'Create a new threshold rule for this account',
      documentation: `
        A boolean to indicate if the user is creating a new threshold rule for this account
      `,
      postSet: function(_, n) {
        if ( n ) {
          this.isExistingSelected = false;
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
      }
    },
    {
      class: 'FObjectProperty',
      name: 'newRuleDetails',
      label: "",
      expression: function (isNewSelected, chosenLiquidityThresholdRule) {
        // make a switch here
        if (!isNewSelected) return null;
        var view;
        switch(chosenLiquidityThresholdRule) {
          case this.LiquidityThresholdRules.NONE:
            view = null;
            break;
          case this.LiquidityThresholdRules.NOTIFY:
            view = this.AccountLiquiditySendOnly.create();
            break;
          case this.LiquidityThresholdRules.NOTIFY_AND_AUTO:
            view = this.AccountLiquiditySendAndAuto.create();
            break;
          default:
            view = null;
            break;
        }
        return view;
      },
    },
    {
      class: 'FObjectProperty',
      name: 'existingRuleDetails',
      label: "",
      expression: function (isExistingSelected, chosenLiquidityThresholdRule) {
        // make a switch here
        return isExistingSelected 
        ? this.AccountLiquidityExistingRule.create({ chosenLiquidityThresholdRule })
        : null;
      },
    }
  ]
});
