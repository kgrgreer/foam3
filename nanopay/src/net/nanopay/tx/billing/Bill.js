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
  name: 'Bill',

  documentation: 'Bill object for Intuit Billing',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  tableColumns: [
    'originatingTransaction',
    'errorCode',
    'chargeToUser',
    'chargeToBusiness',
    'chargeDate',
    'status'
  ],

  sections: [
    {
      name: 'billInformation'
    },
    {
      name: 'systemInformation',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      section: 'billInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      of: 'net.nanopay.integration.ErrorCode',
      documentation: 'Error code associated to transaction error',
      section: 'billInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'FObjectArray',
      name: 'fees',
      of: 'net.nanopay.tx.billing.BillingFee',
      section: 'billInformation',
      order: 30
    },
    {
      class: 'net.nanopay.tx.model.TransactionReference',
      name: 'originatingTransaction',
      section: 'billInformation',
      order: 40,
      gridColumns: 6,
    },
    {
      class: 'Reference',
      targetDAOKey: 'userDAO',
      name: 'chargeToUser',
      of: 'foam.nanos.auth.User',
      documentation: 'User paying the fee',
      section: 'billInformation',
      order: 50,
      gridColumns: 6
    },
    {
      class: 'Reference',
      targetDAOKey: 'businessDAO',
      name: 'chargeToBusiness',
      of: 'net.nanopay.model.Business',
      documentation: 'Business paying the fee',
      section: 'billInformation',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'Date',
      name: 'chargeDate',
      documentation: 'Calculated date of when the fees will be charged',
      section: 'billInformation',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'DateTime',
      name: 'created',
      visibility: 'RO',
      section: 'billInformation',
      order: 80,
      gridColumns: 6
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      section: 'billInformation',
      order: 100,
      gridColumns: 6
    },
    {
      class: 'Enum',
      of: 'net.nanopay.tx.ChargedTo',
      name: 'chargedTo',
      documentation: 'Determines if Payer or Payee is charged the fee',
      section: 'systemInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid',
      section: 'systemInformation',
      order: 20,
      gridColumns: 6
    }
  ]
});
