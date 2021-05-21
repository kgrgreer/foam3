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
  package: 'net.nanopay.account.ui.addAccountModal.liquidityRule.notifyOnly',
  name: 'NotifyOnlyFloor',

  documentation: `
    A view model for the account liquidity send only floor rule
  `,

  properties: [
    {
      class: 'UnitValue',
      name: 'accountBalanceFloor',
      label: 'If the balance of this account falls below',
      documentation: `
        The lower bound of the rule enforcement for liquidity settings
      `,
      validateObj: function(accountBalanceFloor) {
        // ! People should be able to set the floor to zero
        if ( accountBalanceFloor < 0 ) {
          return 'Minimum balance threshold cannot be negative.';
        }
      }
    },
  ],
});
