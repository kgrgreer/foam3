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
  package: 'net.nanopay.tx.errorfee',
  name: 'ErrorChargeFee',

  documentation: 'Represents details on the charges associated to a transaction error',

  properties: [
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'chargeToUser',
      of: 'foam.nanos.auth.User',
      documentation: 'User paying the fee'
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessDAO',
      name: 'chargeToBusiness',
      of: 'net.nanopay.model.Business',
      documentation: 'Business paying the fee'
    },
    {
      class: 'Date',
      name: 'chargeDate',
      documentation: 'Calculated date of when the fees will be charged'
    },
    {
      class: 'UnitValue',
      name: 'amount',
      documentation: 'Amount being charged'
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency of amount being charged'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the charge'
    }
  ]
});
