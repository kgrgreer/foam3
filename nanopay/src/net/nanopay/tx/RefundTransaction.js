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
  package: 'net.nanopay.tx',
  name: 'RefundTransaction',
  extends: 'net.nanopay.tx.RetailTransaction',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.RetailTransaction',
      name: 'refundTransactionId',
      visibility: 'RO'
    },
    {
      class: 'UnitValue',
      name: 'total',
      visibility: 'RO',
      label: 'Total Amount',
      transient: true,
      expression: function(amount) {
        return amount;
      },
      javaGetter: `return getAmount();`,
      unitPropValueToString: async function(x, val, unitPropName) {
        var formattedAmount = val / 100;
        return '$' + x.addCommas(formattedAmount.toFixed(2));
      },
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        this
          .start()
          .addClass('amount-Color-Red')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    }
  ]
});
