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
  name: 'TaxLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  properties: [
    {
      name: 'rate',
      class: 'Double',
      value: 7.777
    },
    {
      name: 'amount',
      class: 'UnitValue',
      unitPropName: 'currency',
      view: { class: 'net.nanopay.liquidity.ui.LiquidCurrencyView' },
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      tableCellFormatter: function(value, obj) {

        obj.currencyDAO.find(obj.currency).then(function(c) {
          if ( c ) {
            this.add(`(${obj.rate.toFixed(2)}%) ` + c.format(value));
          }
        }.bind(this));
      },
    },
  ]
});
