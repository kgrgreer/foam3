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
  package: 'net.nanopay.tx.billing',
  name: 'BillingFee',

  documentation: 'Represents details on the charges associated to a transaction error',

  imports: [
    'currencyDAO'
  ],

  properties: [
    {
      class: 'UnitValue',
      name: 'amount',
      documentation: 'Amount being charged',
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency of amount being charged',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the charge',
      order: 30
    }
  ]
});
