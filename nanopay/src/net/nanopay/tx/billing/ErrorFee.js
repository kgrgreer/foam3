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
  name: 'ErrorFee',

  documentation: 'Represents details on the fee associated to a transaction error',

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'currencyDAO'
  ],

  tableColumns: [
    'id',
    'errorCode',
    'amount',
    'currency',
    'chargedTo',
    'spid'
  ],

  sections: [
    {
      name: 'errorFeeInformation'
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      section: 'errorFeeInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      of: 'net.nanopay.integration.ErrorCode',
      documentation: 'Error code associated to transaction error',
      section: 'errorFeeInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'UnitValue',
      name: 'amount',
      documentation: 'Amount of the error fee',
      unitPropName: 'currency',
      unitPropValueToString: async function(x, val, unitPropName) {
        var unitProp = await x.currencyDAO.find(unitPropName);
        if ( unitProp )
          return unitProp.format(val);
        return val;
      },
      section: 'errorFeeInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency of the fee',
      section: 'errorFeeInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.ChargedTo',
      name: 'chargedTo',
      documentation: 'Determines if Payer or Payee is charged the fee',
      section: 'errorFeeInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      documentation: 'spid the fee applies to',
      section: 'errorFeeInformation',
      order: 60,
      gridColumns: 6
    }
  ]
});
