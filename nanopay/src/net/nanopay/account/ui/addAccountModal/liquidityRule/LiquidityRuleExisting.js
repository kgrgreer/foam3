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
  name: 'LiquidityRuleExisting',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model to choose a liquidity threshold rule from a set of existing threshold rules from the business
  `,

  exports: [
    'predicatedLiquiditySettingsDAO',
  ],

  imports: [
    'liquiditySettingsDAO'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  properties: [
    {
      name: 'predicatedLiquiditySettingsDAO',
      hidden: true,
      // ! ask how to grab the id from liquiditySettings relationship acount
      expression: function(liquiditySettingsDAO) {
        // only return other accounts in the business group
        // ! uncomment the line below once we figure this out
        // return liquiditySettingsDAO.where(this.EQ(this.User.GROUP, user$id));
        return liquiditySettingsDAO.where(this.NEQ(this.LiquiditySettings.NAME, '')); // ! comment this later on
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.liquidity.LiquiditySettings',
      name: 'existingThresholdRule',
      label: 'Threshold rule name',
      targetDAOKey: 'predicatedLiquiditySettingsDAO',
      documentation: `
        A picker to choose which account will excess funds be moved to
        upon hitting the upper bound liquidity threshold
      `,
      validateObj: function(existingThresholdRule) {
        if ( ! existingThresholdRule ) {
          return 'Please select an existing threshold.';
        }
      }
    },
  ],
});
