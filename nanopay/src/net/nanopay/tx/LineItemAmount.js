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
  name: 'LineItemAmount',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.LineItemAmountType',
      name: 'type',
      value: 'TOTAL'
    },
    {
      class: 'UnitValue',
      name: 'value',
      unitPropValueToString: async function(x, val, unitPropName) {
        var formattedAmount = val;
        if ( this.type == net.nanopay.tx.LineItemAmountType.PERCENT ) {
          return amount / 100;
        } else {
          return x.addCommas(formattedAmount.toFixed(2));
        }
      },
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount;
        if ( this.type == net.nanopay.tx.LineItemAmountType.PERCENT ) {
          formattedAmount = amount/100;
          this
            .start()
            .add(formattedAmount, '%')
            .end();
        } else {
          this
            .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
            .end();
        }
      }
    },
  ]
});
