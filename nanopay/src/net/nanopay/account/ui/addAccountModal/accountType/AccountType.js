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
    package: 'net.nanopay.account.ui.addAccountModal.accountType',
    name: 'AccountType',

    documentation: `
      A view for the user to select between Liquid account types
    `,

    properties: [
      {
        class: 'Enum',
        of: 'net.nanopay.account.ui.addAccountModal.accountType.AccountTypes',
        name: 'accountTypePicker',
        documentation: `
          A standard picker based on the AccountType enum
        `,
        validateObj: function(accountTypePicker) {
          if ( ! accountTypePicker ) {
            return 'Please select an account type to proceed.';
          }
        }
      },
    ],
});
