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
  name: 'NotifyAndAutoFloor',
    implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view model for the account liquidity send and auto transaction floor rule
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
      name: 'accountBalanceFloor',
      label: 'If the balance of this account falls below',
      documentation: `
        The lower bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceFloor, resetAccountBalanceFloor) {
        // ! People should be able to set the floor to zero
        if ( accountBalanceFloor < 0 ) {
          return 'Minimum balance threshold cannot be negative.';
        }
        if ( accountBalanceFloor >= resetAccountBalanceFloor ) {
          return 'Minimum balance threshold must be lower than the reset value.';
        }
      }
    },
    {
      class: 'UnitValue',
      name: 'resetAccountBalanceFloor',
      label: 'Reset account balance to',
      documentation: `
        The amount to reset the account balance upon hitting the floor
      `
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'floorMoveFundsFrom',
      label: 'by adding new funds from',
      targetDAOKey: 'otherAccountsPredicatedAccountDAO',
      documentation: `
        A picker to choose which account to transfer funds from if this account
        hits the lower bound liquidity threshold
      `,
      validateObj: function(floorMoveFundsFrom) {
        if ( !floorMoveFundsFrom ) {
          return 'Please select an account extract funds from.';
        }
      }
    },
  ]
});
