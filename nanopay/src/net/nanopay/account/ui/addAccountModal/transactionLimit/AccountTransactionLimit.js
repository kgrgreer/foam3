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
    package: 'net.nanopay.account.ui.addAccountModal.transactionLimit',
    name: 'AccountTransactionLimit',

    documentation: `
      A view model for the maximum transaction size for an account being created in Liquid
    `,

    properties: [
      {
        class: 'UnitValue',
        name: 'maxTransactionSize',
        label: 'The maximum transaction size allowed from this account is...',
        documentation: `
            The currency value of the maximum transaction size
        `,
        validateObj: function(maxTransactionSize) {
          if ( ! maxTransactionSize || maxTransactionSize <= 0 ) {
            return 'Please set a transaction limit before proceeding.';
          }
        }
      },
    ],
});
