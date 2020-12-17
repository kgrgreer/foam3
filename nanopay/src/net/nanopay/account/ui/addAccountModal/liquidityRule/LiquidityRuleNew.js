/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule',
  name: 'LiquidityRuleNew',

  documentation: `
  A view model to choose the liquidity threshold rules
  `,

  requires: [
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode',
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
      of: 'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode',
      name: 'liquidityThresholdRules',
      label: 'I want this threshold to...',
      documentation: `
        A standard picker based on the LiquidityThresholdRules enum
      `,
      validateObj: function (liquidityThresholdRules) {
        if (!liquidityThresholdRules || liquidityThresholdRules == net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityMode.NONE) {
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
      validateObj: function (whoReceivesNotification) {
        if (!whoReceivesNotification) {
          return 'Please select a person to receive the notifications when thresholds are met.';
        }
      }
    },
    {
      class: 'FObjectProperty',
      name: 'liquidityThresholdDetails',
      label: '',
      expression: function (liquidityThresholdRules) {
        switch (liquidityThresholdRules) {
          case this.LiquidityMode.NONE:
            return null;
          case this.LiquidityMode.NOTIFY:
            return this.NotifyOnly.create();
          case this.LiquidityMode.NOTIFY_AND_AUTO:
            return this.NotifyAndAuto.create();
          default:
            return null;
        }
      },
      validateObj: function (liquidityThresholdDetails$errors_, liquidityThresholdDetails$ceilingRuleDetails$accountBalanceCeiling, liquidityThresholdDetails$floorRuleDetails$accountBalanceFloor) {

        // extracting the accountBalanceCeiling and accountBalanceFloor to check for validation
        const accountBalanceCeiling = liquidityThresholdDetails$ceilingRuleDetails$accountBalanceCeiling;

        const accountBalanceFloor = liquidityThresholdDetails$floorRuleDetails$accountBalanceFloor;

        // handling the conflict case when the floor is higher than the ceiling
        if ( ( accountBalanceCeiling && accountBalanceFloor ) && ( accountBalanceCeiling < accountBalanceFloor ) ) {
          return  'The maximum balance threshold must be greater than the minimum balance threshold' ;
        }

        if ( liquidityThresholdDetails$errors_ ) {
          return liquidityThresholdDetails$errors_;
        }
      }
    }
  ],
});
