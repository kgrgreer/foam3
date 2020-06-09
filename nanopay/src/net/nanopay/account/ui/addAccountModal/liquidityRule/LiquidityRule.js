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
  name: 'LiquidityRule',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view for the user to choose between existing and new liquidity rules
  `,

  imports: [
    'currencyDAO'
  ],

  requires: [
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleNew',
    'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleExisting'
  ],


  properties: [
    {
      class: 'Boolean',
      name: 'isNewSelected',
      label: 'Create a new threshold rule for this account',
      documentation: `
        A boolean to indicate if the user is creating a new threshold rule for this account
      `,
      postSet: function(_, n) {
        // here we are automatically making the existing button false if new is selected
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
        // here we are automatically making the new button false if existing is selected
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
      documentation: `
        To show or hide the liquidity rule new view depending on whether
        LiquidityRuleNew is selected or not
      `,
      expression: function (isNewSelected) {
        return isNewSelected ? this.LiquidityRuleNew.create() : null;
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
      documentation: `
        To show or hide the liquidity rule existing view depending on whether
        LiquidityRuleExisting is selected or not
      `,
      expression: function (isExistingSelected) {
        return isExistingSelected ? this.LiquidityRuleExisting.create() : null;
      },
      validateObj: function(existingRuleDetails$errors_) {
        if ( existingRuleDetails$errors_ ) {
          return existingRuleDetails$errors_[0][1];
        }
      }
    }
  ]
});
