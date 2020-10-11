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

  properties: [
    {
      class: 'String',
      name: 'currency',
      gridColumns: 4,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          data$: X.data.currency$,
          sections: [
            {
              heading: 'Available Currencies',
              dao$: X.data.dao$
            }
          ]
        };
      }
    },
    {
      class: 'UnitValue',
      name: 'amount',
      gridColumns: 6,
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.dao.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      }
    },
    {
      name: 'dao',
      documentation: 'DAO used for currency selection',
      visiblility: 'HIDDEN',
      factory: function() {
        return this.currencyDAO;
      }
    }
  ],

  methods: [
    async function toSummary() {
      var unitProp = await this.dao.find(unitPropName);
      if ( unitProp )
        return unitProp.format(val);
      return val;
    }
  ]
});