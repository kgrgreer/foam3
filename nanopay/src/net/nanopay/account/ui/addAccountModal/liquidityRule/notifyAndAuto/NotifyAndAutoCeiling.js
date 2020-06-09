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
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyAndAuto',
  name: 'NotifyAndAutoCeiling',
  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model for the account liquidity send and auto transactions ceiling rule
  `,

  exports: [
    'otherAccountsPredicatedAccountDAO'
  ],
  imports: [
    'currencyDAO',
    'accountDAO',
    'user'
  ],

  requires: [
    'net.nanopay.account.Account',
  ],
  
  properties: [
    {
      name: 'otherAccountsPredicatedAccountDAO',
      hidden: true,
      expression: function(user$id, accountDAO) {
        // only return other accounts in the business group
        // ! uncomment the line below once we figure this out
        // return accountDAO.where(this.EQ(this.Account.OWNER, user$id));
        return accountDAO // ! comment this later on
      }
    },
    {
      class: 'UnitValue',
      name: 'accountBalanceCeiling',
      label: 'If the balance of this account reaches',
      documentation: `
        The upper bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceCeiling, resetAccountBalanceCeiling) {
        if ( accountBalanceCeiling <= 0 ) {
          return 'Maximum balance threshold must be greater than 0';
        }
        if ( accountBalanceCeiling <= resetAccountBalanceCeiling ) {
          return 'Maximum balance threshold must be higher than the reset value.';
        }
      }
    },
    {
      class: 'UnitValue',
      name: 'resetAccountBalanceCeiling',
      label: 'Reset account balance to',
      documentation: `
        The amount to reset the account balance upon hitting the ceiling
      `,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'ceilingMoveFundsTo',
      label: 'by moving the excess funds into',
      targetDAOKey: 'otherAccountsPredicatedAccountDAO',
      documentation: `
        A picker to choose which account will excess funds be moved to
        upon hitting the upper bound liquidity threshold
      `,
      validateObj: function(ceilingMoveFundsTo) {
        if ( !ceilingMoveFundsTo ) {
          return 'Please select an account to move excess funds into.';
        }
      }
    },
  ]
});
