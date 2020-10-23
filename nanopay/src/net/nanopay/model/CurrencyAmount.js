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
  package: 'net.nanopay.model',
  name: 'CurrencyAmount',
  documentation: 'Represents coupling of currency and amount.',

  imports: [ 'currencyDAO' ],

  messages: [
    { name: 'NO_CURRENCY_ERROR', message: 'Please select a currency.' },
    { name: 'NO_AMOUNT_ERROR', message: 'Please enter an amount.' }
  ],

  properties: [
    {
      class: 'String',
      name: 'currency',
      gridColumns: 4,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'Available Currencies',
              dao: X.currencyDAO
            }
          ]
        };
      },
      validationPredicates: [
        {
          args: ['currency'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.model.CurrencyAmount.CURRENCY, null);
          },
          errorMessage: 'NO_CURRENCY_ERROR'
        }
      ]
    },
    {
      class: 'UnitValue',
      name: 'amount',
      gridColumns: 6,
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp ) return unitProp.format(val);
        return val;
      },
      validationPredicates: [
        {
          args: ['amount'],
          predicateFactory: function(e) {
            return e.AND(
              e.NEQ(net.nanopay.model.CurrencyAmount.AMOUNT, null),
              e.NEQ(net.nanopay.model.CurrencyAmount.AMOUNT, 0)
            );
          },
          errorMessage: 'NO_AMOUNT_ERROR'
        }
      ]
    }
  ],

  methods: [
    async function toSummary() {
      var unitProp = await this.currencyDAO.find(unitPropName);
      if ( unitProp ) return unitProp.format(val);
      return val;
    }
  ]
});
