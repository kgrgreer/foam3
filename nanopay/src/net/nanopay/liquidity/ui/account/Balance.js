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
  package: 'net.nanopay.liquidity.ui.account',
  name: 'Balance',
  imports: [
    'data'
  ],
  properties: [
    {
      class: 'String',
      name: 'currency',
      visibility: 'RO',
      expression: function(data$denomination) {
        return data$denomination;
      }
    },
    {
      class: 'Long',
      name: 'balance',
      visibility: 'RO',
      expression: function(data$balance) {
        return data$balance;
      }
    }
  ],
  actions: [
    {
      name: 'addFunds',
      code: function() {
        alert('TODO');
      }
    }
  ]
});
