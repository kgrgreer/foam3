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
    { name: 'NO_CURRENCY_ERROR', message: 'Currency required' },
    { name: 'NO_AMOUNT_ERROR', message: 'Amount required' },
    { name: 'CURRENCY_PLACEHOLDER', message: 'Select currency' },
    { name: 'AVAILABLE_CURRENCIES', message: 'Available Currencies' }
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
          placeholder: this.CURRENCY_PLACEHOLDER,
          sections: [
            {
              heading: this.sourceCls_.AVAILABLE_CURRENCIES,
              dao$: X.data.customCurrencyDAO$
            }
          ]
        };
      },
      validationPredicates: [
        {
          errorMessage: 'NO_CURRENCY_ERROR',
          args: ['currency'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.model.CurrencyAmount.CURRENCY, null);
          }
        }
      ]
    },
    {
      class: 'UnitValue',
      name: 'amount',
      gridColumns: 6,
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await this.customCurrencyDAO.find(unitPropName);
        if ( unitProp ) return unitProp.format(val);
        return val;
      },
      validationPredicates: [
        {
          errorMessage: 'NO_AMOUNT_ERROR',
          args: ['amount'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.model.CurrencyAmount.AMOUNT, null);
          }
        }
      ],
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCurrencyDAO',
      documentation: 'DAO used for currency selection',
      visibility: 'HIDDEN',
      preSet: function(_, n) {
        if ( n.of != foam.core.Currency ) {
          console.warn('Custom currency dao provided in CurrencyAmount view is not of currency model.');
          return this.currencyDAO;
        }
        return n;
      },
      factory: function() {
        return this.currencyDAO;
      }
    }
  ],

  methods: [
    async function toSummary() {
      var unitProp = await this.customCurrencyDAO.find(unitPropName);
      if ( unitProp ) return unitProp.format(val);
      return val;
    }
  ]
});
