foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule',
  name: 'LiquidityRuleNew',

  documentation: `
  A view model to choose the liquidity threshold rules
  `,

  requires: [
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRules',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto.NotifyAndAuto',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly.NotifyOnly'
  ],

  exports: [
    'whoReceivesPredicatedUserDAO',
  ],

  imports: [
    'user',
    'userDAO'
  ],

  properties: [
    {
      class: 'Enum',
      of: 'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRules',
      name: 'liquidityThresholdRules',
      label: 'I want this threshold to...',
      documentation: `
        A standard picker based on the LiquidityThresholdRules enum
      `,
      validateObj: function(liquidityThresholdRules) {
        if ( ! liquidityThresholdRules || liquidityThresholdRules == net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRules.NONE ) {
          return 'Please select what to do with this threshold';
        }
      }
    },
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
      class: 'FObjectProperty',
      name: 'liquidityThresholdDetails',
      label: '',
      expression: function (liquidityThresholdRules) {
        switch ( liquidityThresholdRules ) {
          case this.LiquidityRules.NONE :
            return null;
          case this.LiquidityRules.NOTIFY :
            return this.NotifyOnly.create();
          case this.LiquidityRules.NOTIFY_AND_AUTO :
            return this.NotifyAndAuto.create();
          default:
            return null;
        }
      },
      validateObj: function(liquidityThresholdDetails$errors_) {
        if ( liquidityThresholdDetails$errors_ ) {
          return liquidityThresholdDetails$errors_ ? liquidityThresholdDetails$errors_ : 'Please select what to do with this threshold';
        }
      }
    }
  ],
});
